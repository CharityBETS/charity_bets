from ..models import Bet, UserBet, User, Comment, Charity
from flask import session, Blueprint, request, jsonify
from flask.ext.login import current_user, login_required
from ..extensions import db

charities = Blueprint("charities", __name__)

@charities.route("/charities", methods = ["GET"])
@login_required
def view_all_charities():
    charities = Charity.query.all()
    charities = [charity.make_dict() for charity in charities]
    [charity.pop('token', None) for charity in charities]

    if charities:
        return jsonify({'data': charities}), 201
    else:
        return jsonify({"ERROR": "No charities available."}), 401


@charities.route("/charities/<int:id>", methods=["GET"])
@login_required
def view_charity(id):
    charity = Charity.query.filter_by(id = id).first()
    if charity:
        charity = charity.make_dict()
        del charity['token']
        return jsonify({'data': charity})
    else:
        return jsonify({"ERROR": "Charity does not exist."}), 401
