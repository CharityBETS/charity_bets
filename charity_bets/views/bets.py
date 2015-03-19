from functools import wraps
from ..models import Bet, UserBet, User
from flask import session, Blueprint, url_for, request, redirect, flash, render_template, jsonify
from ..forms import BetForm
from flask.ext.login import current_user, login_required
from ..extensions import db
from ..emails import send_email, bet_creation_notification
import json
from charity_bets import mail
from flask_mail import Message


bets = Blueprint("bets", __name__)


@bets.route("/user/bets", methods = ["POST"])
def create_bet():
    body = request.get_data(as_text=True)
    data = json.loads(body)
    #  Enter Required data into Form
    form = BetForm( title=data['title'],
                    amount = int(data['amount']),
                    formdata=None, csrf_enabled=False)
    challenger = User.query.filter_by(name = data['challenger']).first()

    # Validate Form
    if form.validate():
        bet = Bet(title=form.title.data,
                  amount=form.amount.data,
                  creator = current_user.id,
                  challenger = challenger.id,
                  challenger_name = challenger.name,
                  challenger_facebook_id = challenger.facebook_id,
                  creator_name = current_user.name,
                  creator_facebook_id = current_user.facebook_id
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
        emailing is False:
        if emailing:
            bet_creation_notification(current_user, challenger, bet)

        bet = bet.make_dict()

        return (jsonify({ 'data': bet }), 201)

    else:
        return form.errors, 400


@bets.route("/user/bets", methods = ["GET"])
def view_bets():
    bet_list = []
    bets = UserBet.query.filter_by(user_id = current_user.id).all()
    for a_bet in bets:
       bet = Bet.query.filter_by(id = a_bet.bet_id).first()
       if bet:
           bet_list.append(bet)
    if len(bet_list) > 0:
        bets = [bet.make_dict() for bet in bet_list]

    return jsonify({"data": bets}), 201


@bets.route("/bets", methods = ["GET"])
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
def view_bet(id):
    bet = Bet.query.filter_by(id = id).first()
    challenger = User.query.filter_by(id=bet.challenger).first()
    if bet:
        bet = bet.make_dict()
        return jsonify({'data': bet})
    else:
        return jsonify({"ERROR": "Bet does not exist."}), 401

@bets.route("/bets/<int:id>", methods = ["PUT"])
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
                    else:
                        bet.creator_outcome = bet.creator

                elif current_user.id == bet.challenger:
                    if data["outcome"] == -1:
                        bet.challenger_outcome = bet.creator
                    else:
                        bet.creator_outcome = bet.challenger
                else:
                    return jsonify({"Error, Not authorized"})
                return jsonify({"data": bet.make_dict()}), 401

            else:
                setattr(bet, key, data[key])

        db.session.commit()
        return jsonify({"data": bet.make_dict()}), 401

    else:
        return jsonify({"ERROR": "Bet is not in database"})

def edit_generator():
    edits = []
