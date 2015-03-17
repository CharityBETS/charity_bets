from functools import wraps
from ..models import Bet, UserBet
from flask import session, Blueprint, url_for, request, redirect, flash, render_template, jsonify
from ..forms import BetForm
from flask.ext.login import current_user
from ..extensions import db
import json
bets = Blueprint("bets", __name__)


@bets.route("/user/bets", methods = ["POST"])
def create_bet():
    body = request.get_data(as_text=True)
    data = json.loads(body)
    #  Enter Required data into Form
    form = BetForm( title=data['title'],
                    amount = int(data['amount']),
                    formdata=None, csrf_enabled=False)
    # Validate Form
    if form.validate():
        bet = Bet(title=form.title.data,
                  amount=form.amount.data,
                  creator = current_user.id)

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
    bets = [bet.make_dict() for bet in bets]
    if bets:
        return jsonify({'data': bets}), 201
    else:
        return jsonify({"ERROR": "No bets available."}), 401

@bets.route("/bets/<int:id>", methods = ["GET"])
def view_bet(id):
    bet = Bet.query.filter_by(id = id).first()
    if bet:
        bet = bet.make_dict()
        return jsonify({'data': bet})
    else:
        return jsonify({"ERROR": "Bet does not exist."}), 401
        
