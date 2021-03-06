from ..models import Bet, UserBet, User, Comment, Charity, Funder
from flask import (session, Blueprint, url_for, request, redirect, flash,
                    render_template, jsonify, current_app)
from ..forms import BetForm, CommentForm
from flask.ext.login import current_user, login_required
from ..extensions import db
from ..emails import (send_email, bet_creation_notification,
                       win_claim_notification, loss_claim_notification,
                       disputed_bet_notification, you_lost_notification,
                       bet_acceptance_notification, bet_canceled,
                       bet_declined)
from .fake_bet import fake_bet
import json
from charity_bets import mail
from flask_mail import Message
import stripe
from flask import current_app as app
import datetime
from sqlalchemy import or_


bets = Blueprint("bets", __name__)

def add_wins_losses(bet):
    user = User.query.filter_by(id = bet.verified_loser).first()
    user.losses = user.losses + 1
    user.win_streak = 0
    user.money_lost = user.money_lost + bet.amount

    user = User.query.filter_by(id = bet.verified_winner).first()
    user.wins = user.wins + 1
    user.win_streak = user.win_streak + 1
    if user.win_streak > user.longest_win_streak:
        user.longest_win_streak = user.win_streak
    user.money_won = user.money_won + bet.amount

def user_money_raised(bet):
    creator = User.query.filter_by(id = bet.creator).first()
    challenger = User.query.filter_by(id=bet.challenger).first()
    if creator.id == bet.verified_winner:
        creator.donation_money_raised += bet.creator_money_raised

    if challenger.id == bet.verified_winner:
        challenger.donation_money_raised += bet.challenger_money_raised


def charge_funders(bet):
    """At the resolution of the bet, this charges all the losing funders"""
    user = User.query.filter_by(id = bet.verified_winner).first()

    if user.id == bet.creator:
        charity = Charity.query.filter_by(name = bet.charity_creator).first()
    if user.id == bet.challenger:
        charity = Charity.query.filter_by(name = bet.charity_challenger).first()

    funders = Funder.query.filter_by(bet_id = bet.id,
                                     charity_token = charity.access_token).all()

    stripe.api_key = charity.access_token
    for funder in funders:
        stripe.Charge.create(
            amount = int(funder.amount)*100,
            currency = "usd",
            customer = funder.stripe_customer_id
        )

#check if a bets outcome is resolved
def check_resolution(bet):
    if bet.creator_outcome and bet.challenger_outcome:
        if bet.creator_outcome == bet.challenger_outcome:
            bet.status = "complete"
            if bet.creator_outcome == bet.creator:
                bet.verified_winner = bet.creator
                bet.verified_loser = bet.challenger
            else:
                bet.verified_winner = bet.challenger
                bet.verified_loser = bet.creator

            add_wins_losses(bet)
            user_money_raised(bet)

            bet.loser_paid = "unpaid"
            winner = User.query.filter_by(id=bet.verified_winner).first()
            bet.winner_name = winner.name

            db.session.commit()
            charge_funders(bet)

        else:
            bet.status = "conflict"
            bet.mail_track = "conflict"

            user = User.query.filter_by(id = bet.creator).first()
            user.bet_conflicts = user.bet_conflicts + 1
            user = User.query.filter_by(id = bet.challenger).first()
            user.bet_conflicts = user.bet_conflicts + 1
            db.session.commit()
    else:
        bet.status = "unresolved"
        db.session.commit()

# this needs to be tested


def bet_chart_data(bet):
    # pulls funding data for bet challenger
    challenger_funders = Funder.query.filter_by(bet_id = bet.id,
                                                is_funding = bet.challenger).all()

    challenger_donations =[{"x":0, "y": 0}]
    if challenger_funders:
        total_donations = 0
        funder_tick = 0

    for funder in challenger_funders:
        total_donations += funder.amount
        funder_tick += 1
        challenger_donations.append({"x": funder_tick, "y": total_donations})

    # pulls funding data for bet creator

    creator_funders = Funder.query.filter_by(bet_id = bet.id,
                                             is_funding = bet.creator).all()
    creator_donations =[{"x":0, "y": 0}]
    if creator_funders:
        total_donations = 0
        funder_tick = 0

    for funder in creator_funders:
        total_donations += funder.amount
        funder_tick += 1
        creator_donations.append({"x": funder_tick, "y": total_donations})

    return {"creator_data":creator_donations,
            "challenger_data":challenger_donations}


@bets.route("/user/bets", methods = ["POST"])
@login_required
def create_bet():
    body = request.get_data(as_text=True)
    data = json.loads(body)
    #  Enter Required data into Form
    form = BetForm( title=data['title'],
                    amount = int(data['amount']),
                    charity_creator = data['charity_creator'],
                    formdata=None, csrf_enabled=False)
    challenger = User.query.filter_by(name = data['challenger']).first()
    charity = Charity.query.filter_by(name = data['charity_creator']).first()

    # Validate Form
    if form.validate():
        bet = Bet(title=form.title.data,
                  amount=form.amount.data,
                  creator = current_user.id,
                  challenger = challenger.id,
                  challenger_name = challenger.name,
                  challenger_facebook_id = challenger.facebook_id,
                  creator_name = current_user.name,
                  creator_facebook_id = current_user.facebook_id,
                  charity_creator = charity.name,
                  charity_creator_id = charity.id,
                  total_money_raised = form.amount.data
                  )

        # Enter Optional Data Into Model
        if 'date' in data:
            bet.date = data['date']
        if 'description' in data:
            bet.description = data['description']
        if 'location' in data:
            bet.location = data['location']

        db.session.add(bet)
        db.session.commit()

        # Message sent to the other party of the bet
        bet_creation_notification(current_user, challenger, bet)
        bet.mail_track = "new_bet"
        db.session.add(bet)
        db.session.commit()

        user_bet = UserBet(user_id = current_user.id,
                           bet_id = bet.id)

        db.session.add(user_bet)
        db.session.commit()

        bet = bet.make_dict()

        return (jsonify({ 'data': bet }), 201)

    else:
        return form.errors, 400


def bet_aggregator(bets, bet_list):
    for a_bet in bets:
        bet = Bet.query.filter_by(id=a_bet.id).first()
        if bet:
            bet_list.append(bet)
    return bet_list

def current_user_filter(bet_status):
    return Bet.query.filter(or_(Bet.creator==current_user.id,
                                 Bet.challenger==current_user.id)
                             ).filter_by(status=bet_status).all()

@bets.route("/user/bets", methods = ["GET"])
@login_required
def view_bets():
    bets1 = current_user_filter("pending")
    bets2 = current_user_filter("active")
    bets3 = current_user_filter("unresolved")
    bets4 = current_user_filter("complete")
    bets5 = current_user_filter("conflict")
    bet_list = []
    bet_list = bet_aggregator(bets1, bet_list)
    bet_list = bet_aggregator(bets2, bet_list)
    bet_list = bet_aggregator(bets3, bet_list)
    bet_list = bet_aggregator(bets4, bet_list)
    bet_list = bet_aggregator(bets5, bet_list)
    if len(bet_list) > 0:
        bets = [bet.make_dict() for bet in bet_list]
        for bet in bets:
            if bet['challenger']==current_user.id and bet['status']=='pending':
                bet['needs_accepting'] = 'y'
            if bet['status'] == 'unresolved':
                if current_user.id != bet['creator_outcome']:
                    if current_user.id != bet['challenger_outcome']:
                        bet['maybe_you_lost'] = 'y'
                if current_user.id != bet['challenger_outcome']:
                    if current_user.id != bet['creator_outcome']:
                        bet['maybe_you_lost'] = 'y'
        return jsonify({"data": bets}), 201
    else:
        return jsonify({'data': {}})

def user_filter(bet_status, id):
    return Bet.query.filter(or_(Bet.creator==id,
                                 Bet.challenger==id)
                             ).filter_by(status=bet_status).all()

@bets.route("/user/<int:id>/bets", methods = ["GET"])
@login_required
def view_users_bets(id):
    bets1 = user_filter("active", id)
    bets2 = user_filter("complete", id)
    bets3 = user_filter("unresolved", id)
    bets4 = user_filter("pending", id)
    bet_list = []
    bet_list = bet_aggregator(bets1, bet_list)
    bet_list = bet_aggregator(bets2, bet_list)
    bet_list = bet_aggregator(bets3, bet_list)
    bet_list = bet_aggregator(bets4, bet_list)
    if len(bet_list) > 0:
        bets = [bet.make_dict() for bet in bet_list]
        return jsonify({"data": bets }), 201
    else:
        return jsonify({'data': {}})


@bets.route("/bets", methods = ["GET"])
@login_required
def view_all_bets():
    bets = Bet.query.order_by(Bet.amount.desc()).all()
    all_bets = [bet.make_dict() for bet in bets]
    all_bets = [bet for bet in all_bets if bet["status"]!='conflict']
    if bets:
        return jsonify({'data': all_bets}), 201
    else:
        return jsonify({'data': {}})

@bets.route("/bets/<filter>/<sorter>", methods = ["GET"])
@login_required
def view_filtered_sorted_bets(filter, sorter):
    if filter == "all":
        bets = Bet.query.order_by((getattr(Bet, sorter)).desc()).all()
    else:
        bets = Bet.query.filter_by(status=filter).order_by((getattr(Bet, sorter)).desc()).all()

    all_bets = [bet.make_dict() for bet in bets]
    all_bets = [bet for bet in all_bets if bet["status"]!='conflict']
    if bets:
        return jsonify({'data':all_bets}), 201
    else:
        return jsonify({'data': {}})


@bets.route("/bets/<int:id>", methods = ["GET"])
@login_required
def view_bet(id):
    if id==0:
        seed_bet = fake_bet().make_dict()
        return jsonify({'data': seed_bet})
    else:
        bet = Bet.query.filter_by(id = id).first()
        creator = User.query.get(bet.creator)
        challenger = User.query.get(bet.challenger)
        comments = Comment.query.filter_by(bet_id=id).all()
        chart_data = bet_chart_data(bet)
        all_comments = []
        if bet:
            bet = bet.make_dict()
            for comment in comments:
                comment = comment.make_dict()
                all_comments.append(comment)
            bet["comments"] = all_comments
            creator_record = "{} - {}".format(creator.wins, creator.losses)
            bet['creator_record'] = creator_record
            challenger_record = "{} - {}".format(challenger.wins, challenger.losses)
            bet['challenger_record'] = challenger_record
            bet['chart_data'] = chart_data

            return jsonify({'data': bet})
        else:
            return jsonify({"ERROR": "Bet does not exist."}), 400

@bets.route("/bets/<int:id>", methods = ["DELETE"])
@login_required
def cancel_bet(id):
    bet = Bet.query.get(id)
    creator = User.query.filter_by(id=bet.creator).first()
    challenger = User.query.filter_by(id=bet.challenger).first()
    if bet:
        if bet.status == "pending":
            if current_user.id == bet.creator:
                db.session.delete(bet)
                db.session.commit()
                # Email other bet participant
                bet_canceled(creator, challenger, bet)
                return jsonify({"Success": "Bet Deleted"})
            if current_user.id == bet.challenger:
                db.session.delete(bet)
                db.session.commit()
                #Email other bet participant
                bet_declined(creator, challenger, bet)
                return jsonify({"Success": "Bet Deleted"})
        else:
            return ({"UNAUTHORIZED": "You can't delete this bet."}), 401
    else:
        return jsonify({"ERROR": "Bet does not exist."}), 400


@bets.route("/bets/<int:id>", methods = ["PUT"])
@login_required
def update_bet(id):
    bet = Bet.query.filter_by(id = id).first()
    if bet:
        body = request.get_data(as_text=True)
        data = json.loads(body)
        keys = data.keys()
        for key in keys:
            if key == "outcome":
                if current_user.id == bet.creator:
                    if data["outcome"] == -1:
                        bet.creator_outcome = bet.challenger
                        bet.challenger_outcome = bet.challenger
                        db.session.commit()
                    else:
                        bet.creator_outcome = bet.creator
                        db.session.commit()

                elif current_user.id == bet.challenger:
                    if data["outcome"] == -1:
                        bet.creator_outcome = bet.creator
                        bet.challenger_outcome = bet.creator
                        db.session.commit()
                    else:
                        bet.challenger_outcome = bet.challenger
                        db.session.commit()

                else:
                    return jsonify({"Error, Not authorized"})

                check_resolution(bet)
            if key == "charity_challenger":
                setattr(bet, key, data[key])
                charity = Charity.query.filter_by(name=data[key]).first()
                setattr(bet, "charity_challenger_id", charity.id)
                db.session.commit()
            else:
                setattr(bet, key, data[key])
                db.session.commit()
        user = User.query.filter_by(id = bet.creator).first()
        user.bets_made = user.wins + user.losses + user.bet_conflicts

        # Emailing at various bet states:
        creator = User.query.filter_by(id = bet.creator).first()
        challenger = User.query.filter_by(id = bet.challenger).first()

        if bet.mail_track == 'new_bet':
            if bet.status == 'active':
                bet_acceptance_notification(creator, challenger, bet)
                bet.mail_track = 'bet_accepted'
                db.session.commit()

        if bet.mail_track == 'bet_accepted' or 'win_claimed':
            if bet.challenger_outcome or bet.creator_outcome:
                if bet.verified_loser:
                    loss_claim_notification(bet)
                    you_lost_notification(bet)
                    bet.mail_track = "bet_over"
                    db.session.commit()
                else:
                    win_claim_notification(bet)
                    bet.mail_track = 'win_claimed'
                    db.session.commit()

        if bet.mail_track == 'conflict':
            disputed_bet_notification(bet)
            bet.mail_track == 'no_more_mail'
            db.session.commit()

        user = User.query.filter_by(id = bet.creator).first()
        user.bets_made = user.wins + user.losses + user.bet_conflicts
        if user.bets_made > 0:
            user.average_bet_size = (user.money_won + user.money_lost) / user.bets_made
        if user.bets_made == 0:
                user.average_bet_size = user.money_won + user.money_lost

        user = User.query.filter_by(id = bet.challenger).first()
        user.bets_made = user.wins + user.losses + user.bet_conflicts
        if user.bets_made > 0:
            user.average_bet_size = (user.money_won + user.money_lost) / user.bets_made
        if user.bets_made == 0:
                user.average_bet_size = user.money_won + user.money_lost


        return jsonify({"data": bet.make_dict()}), 201

    else:
        return jsonify({"ERROR": "Bet is not in database"})


@bets.route("/bets/<int:id>/comments", methods = ["POST"])
@login_required
def view_comments(id):
    bet = Bet.query.filter_by(id = id).first()
    body = request.get_data(as_text=True)
    data = json.loads(body)
    form = CommentForm( comment=data['comment'],
                        formdata=None, csrf_enabled=False)
    if form.validate():
        user_comment = Comment(comment = form.comment.data,
                               user_id = current_user.id,
                               bet_id = bet.id,
                               name = current_user.name,
                               timestamp = datetime.datetime.now())

        db.session.add(user_comment)
        db.session.commit()

        user_comment = user_comment.make_dict()

        return jsonify({ 'data': user_comment }), 201

    else:
        return jsonify({"ERROR": "No comments yet"})


@bets.route("/bets/<int:id>/pay_bet", methods = ["POST"])
@login_required
def charge_loser(id):
    body = request.get_data(as_text=True)
    print("THIS IS THE BODY...... ", body)
    data = json.loads(body)
    print("THIS IS THE DATA...... ", data)
    bet = Bet.query.filter_by(id = id).first()
    print("THIS IS THE BET...... ", bet)
    user = User.query.filter_by(id = bet.verified_winner).first()
    print("THIS IS THE USER...... ", user)
    if user.id == bet.creator:
        charity = Charity.query.filter_by(name = bet.charity_creator).first()
        bet.winning_charity = charity.id
        bet.winning_charity_name = charity.name
    if user.id == bet.challenger:
        charity = Charity.query.filter_by(name = bet.charity_challenger).first()
        bet.winning_charity = charity.id
        bet.winning_charity_name = charity.name

    charity.amount_earned = charity.amount_earned + bet.amount
    bet.loser_paid = "paid"
    db.session.commit()
    try:
        stripe.api_key = charity.access_token
        card_token = data['token']
        charge = stripe.Charge.create(
            amount = int(bet.amount)*100,
            currency='usd',
            source = card_token,
            description='BET PAYMENT')
        return jsonify({"SUCESSFUL PAYMENT":"SUCCESSFUL PAYMENT"})
    except:
        return jsonify ({"Error":"UNSUCCESSFUL PAYMENT"})


@bets.route("/bets/<int:id>/fund_bettor", methods = ["POST"])
@login_required
def fund_bet(id):
    body = request.get_data(as_text=True)
    data = json.loads(body)
    bet = Bet.query.filter_by(id = id).first()
    amount = int(data["amount"])
    if "creatorid" in data.keys():
        charity = Charity.query.filter_by(name = bet.charity_challenger).first()
        isfunding = bet.creator
        bet.creator_money_raised += amount
        bet.total_money_raised += amount
        db.session.commit()
    if "challengerid" in data.keys():
        charity = Charity.query.filter_by(name = bet.charity_creator).first()
        isfunding = bet.challenger
        bet.challenger_money_raised += amount
        bet.total_money_raised += amount
        db.session.commit()

    stripe.api_key = charity.access_token
    customer = stripe.Customer.create(
        source = data['token'],
        description="payinguser@example.com"
        )
    # print(customer)
    funder = Funder(is_funding = isfunding,
                    user_id = current_user.id,
                    bet_id = id,
                    amount = amount,
                    stripe_customer_id = customer.id,
                    charity = charity.name,
                    charity_token = charity.access_token,
                    date = str(datetime.datetime.now())[:16])

    db.session.add(funder)
    db.session.commit()
    return jsonify({"Data":funder.make_dict()})

@bets.route("/bets/<int:id>/fake_funder", methods = ["POST"])
@login_required
def fake_funder(id):
    body = request.get_data(as_text=True)
    data = json.loads(body)
    bet = Bet.query.filter_by(id = id).first()
    amount = int(data["amount"])
    if "creatorid" in data.keys():
        charity = Charity.query.filter_by(name = bet.charity_challenger).first()
        isfunding = bet.creator
        bet.creator_money_raised += amount
        bet.total_money_raised += amount
        db.session.commit()
    if "challengerid" in data.keys():
        charity = Charity.query.filter_by(name = bet.charity_creator).first()
        isfunding = bet.challenger
        bet.challenger_money_raised += amount
        bet.total_money_raised += amount
        db.session.commit()

    funder = Funder(is_funding = isfunding,
                    user_id = current_user.id,
                    bet_id = id,
                    amount = amount,
                    stripe_customer_id = "FAKE CUSTOMER ID",
                    charity = charity.name,
                    charity_token = charity.access_token,
                    date = str(datetime.datetime.now())[:16])
    db.session.add(funder)
    db.session.commit()

    return jsonify({"Data":funder.make_dict()})
