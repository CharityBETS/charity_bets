from flask import (session, Blueprint, url_for, request, redirect,
                   render_template, jsonify)
from flask.ext.login import current_user, login_required
from ..models import Bet, UserBet, User, Comment, Charity
from ..extensions import db


admin = Blueprint("admin", __name__)

def verify_user(current_user):
    email_list = ["betsforcharity@gmail.com",
                  "bret.runestad@gmail.com"]
    if current_user.email in email_list:
        return True
    else:
        return False


@admin.route("/api/user/<int:id>", methods=["DELETE"])
@login_required
def delete_user(id):
    if verify_user(current_user):
        user = User.query.get(id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return jsonify({"Success": "User Deleted"})
        else:
            return jsonify({"ERROR": "Could not delete"}), 400
    else:
        return jsonify({"ERROR": "Not authorized to make this request"}), 401

@admin.route("/api/bets/<int:id>", methods=["DELETE"])
@login_required
def delete_bet(id):
    if verify_user(current_user):
        bet = Bet.query.get(id)
        if bet:
            db.session.delete(bet)
            db.session.commit()
            return jsonify({"Success": "Bet Deleted"})
        else:
            return jsonify({"ERROR": "Could not delete"}), 400
    else:
        return jsonify({"ERROR": "Not authorized to make this request"}), 401

@admin.route("/api/charities/<int:id>", methods=["DELETE"])
@login_required
def delete_charity(id):
    if verify_user(current_user):
        charity = Charity.query.get(id)
        if charity:
            db.session.delete(charity)
            db.session.commit()
            return jsonify({"Success": "Charity Deleted"})
        else:
            return jsonify({"ERROR": "Could not delete"}), 400
    else:
        return jsonify({"ERROR": "Not authorized to make this request"}), 401
