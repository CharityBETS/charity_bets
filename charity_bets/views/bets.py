from functools import wraps
from ..models import Bet, UserBet, User, Comment, Charity
from flask import session, Blueprint, url_for, request, redirect, flash, render_template, jsonify
from ..forms import BetForm, CommentForm
from flask.ext.login import current_user, login_required
from ..extensions import db
from ..emails import send_email, bet_creation_notification, win_claim_notification, loss_claim_notification
import json
from charity_bets import mail
from flask_mail import Message
from ..email_switch import emailing
import stripe
from datetime import datetime


bets = Blueprint("bets", __name__)

#check if a bets outcome is resolved
def check_resolution(bet):
    if bet.creator_outcome == bet.challenger_outcome:
        bet.status = "complete"
        bet.verified_winner = bet.creator_outcome
        if bet.creator_outcome == bet.creator:
            bet.verified_loser = bet.challenger
        else:
            bet.verified_loser = bet.creator
        bet.loser_paid = "unpaid"
        db.session.add(bet)
        db.session.commit()
    else:
        bet.status = "unresolved"
        db.session.add(bet)
        db.session.commit()


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
                  charity_creator_id = charity.id
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

        user_bet = UserBet(user_id = current_user.id,
                           bet_id = bet.id)

        db.session.add(user_bet)
        db.session.commit()

        # Message sent to the other party of the bet
        if emailing == "on":
            bet_creation_notification(current_user, challenger, bet)

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

@bets.route("/user/bets", methods = ["GET"])
@login_required
def view_bets():
    creator_bets = Bet.query.filter_by(creator=current_user.id).all()
    challenger_bets = Bet.query.filter_by(challenger=current_user.id).all()
    bet_list = []
    bet_list = bet_aggregator(creator_bets, bet_list)
    bet_list = bet_aggregator(challenger_bets, bet_list)
    if len(bet_list) > 0:
        bets = [bet.make_dict() for bet in bet_list]
        return jsonify({"data": bets}), 201
    return jsonify({"ERROR": "No bets available."}), 401


@bets.route("/user/<int:id>/bets", methods = ["GET"])
@login_required
def view_users_bets(id):
    creator_bets = Bet.query.filter_by(creator=id).all()
    challenger_bets = Bet.query.filter_by(challenger=id).all()
    bet_list = []
    bet_list = bet_aggregator(creator_bets, bet_list)
    bet_list = bet_aggregator(challenger_bets, bet_list)
    if len(bet_list) > 0:
        bets = [bet.make_dict() for bet in bet_list]
        return jsonify({"data": bets}), 201
    return jsonify({"ERROR": "No bets available."}), 401



@bets.route("/bets", methods = ["GET"])
@login_required
def view_all_bets():
    bets = Bet.query.all()
    all_bets = []
    for bet in bets:
        challenger = User.query.filter_by(id=bet.challenger).first()
        bet = bet.make_dict()
        all_bets.append(bet)

    if bets:
        return jsonify({'data': all_bets}), 201
    else:
        return jsonify({"ERROR": "No bets available."}), 401


@bets.route("/bets/<int:id>", methods = ["GET"])
@login_required
def view_bet(id):
    bet = Bet.query.filter_by(id = id).first()
    comments = Comment.query.filter_by(bet_id=id).all()
    all_comments = []
    if bet:
        bet = bet.make_dict()
        for comment in comments:
            comment = comment.make_dict()
            all_comments.append(comment)
        bet["comments"] = all_comments
        return jsonify({'data': bet})
    else:
        return jsonify({"ERROR": "Bet does not exist."}), 401

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
                        bet.creator_outcome = bet.challenger
                        db.session.commit()

                else:
                    return jsonify({"Error, Not authorized"})
                #return jsonify({"data": bet.make_dict()}), 201

                check_resolution(bet)
            if key == "charity_challenger":
                setattr(bet, key, data[key])
                charity = Charity.query.filter_by(name=data[key]).first()
                setattr(bet, "charity_challenger_id", charity.id)
                db.session.commit()
            else:
                setattr(bet, key, data[key])
                db.session.commit()

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
                               timestamp = datetime.now())

        db.session.add(user_comment)
        db.session.commit()

        user_comment = user_comment.make_dict()

        return jsonify({ 'data': user_comment }), 201

    else:
        return jsonify({"ERROR": "No comments yet"})

@bets.route("/bets/<int:id>/pay_bet", methods = ["POST"])
@login_required
def charge_loser(id):
    bet = Bet.query.filter_by(id = id).first()
    print("This is the bet: {}".format(bet.verified_loser))
    user = User.query.filter_by(id = bet.verified_loser).first()
    print("This is the user: {}".format(user))
    if user.id == bet.creator:
        charity = Charity.query.filter_by(id = bet.charity_challenger)
    if user.id == bet.challenger:
        charity = Charity.query.filter_by(id = bet.charity_creator)

    stripe.api_key = charity.token
    card_token = request.form['stripeToken']
    charge = stripe.Charge.create(
        amount = bet.amount,
        currency='usd',
        source = card_token,
        description='BET PAYMENT')

    return jsonify({"SUCESSFUL PAYMENT":"SUCCESSFUL PAYMENT"})

@bets.route("/charities", methods = ["GET"])
@login_required
def view_all_charities():
    charities = Charity.query.all()
    charities = [charity.make_dict() for charity in charities]
    [charity.pop('token', None) for charity in charities]

    if charities:
        return jsonify({'data': charities}), 201
    else:
        return jsonify({"ERROR": "No charities available."}), 401


@bets.route("/charities/<int:id>", methods=["GET"])
@login_required
def view_charity(id):
    charity = Charity.query.filter_by(id = id).first()
    if charity:
        charity = charity.make_dict()
        del charity['token']
        return jsonify({'data': charity})
    else:
        return jsonify({"ERROR": "Charity does not exist."}), 401
