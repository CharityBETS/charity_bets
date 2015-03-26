from ..models import Bet, UserBet, User, Comment, Charity
from flask import session, Blueprint, request, jsonify
from flask.ext.login import current_user, login_required
from ..extensions import db
from .fake_bet import fake_charity

charities = Blueprint("charities", __name__)

@charities.route("/charities", methods = ["GET"])
@login_required
def view_all_charities():
    charities = Charity.query.all()
    charities = [charity.make_dict() for charity in charities]

    if charities:
        return jsonify({'data': charities}), 201
    else:
        fake_charity_list = []
        seed_charity = fake_charity()
        fake_charity_list.append(seed_charity)
        fake_charities = [fake_charity.make_dict() for fake_charity in fake_charity_list]
        return jsonify({"data": fake_charities}), 201


@charities.route("/charities/<int:id>", methods=["GET"])
@login_required
def view_charity(id):
    charity = Charity.query.filter_by(id = id).first()
    if charity:
        charity = charity.make_dict()
        return jsonify({'data': charity})
    else:
        return jsonify({"ERROR": "Charity does not exist."}), 401
