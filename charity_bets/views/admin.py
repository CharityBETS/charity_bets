from flask import (session, Blueprint, url_for, request, redirect,
                   render_template, jsonify)
from flask.ext.login import current_user, login_required
from ..models import Bet, UserBet, User, Comment, Charity
from ..extensions import db
from ..forms import CharityForm


admin = Blueprint("admin", __name__)

def verify_user(current_user):
    email_list = ["betsforcharity@gmail.com",
                  "bret.runestad@gmail.com",
                  "bbatty32@yahoo.com",
                  "dn78685@appstate.edu",
                  "tomrau@gmail.com"]
    if current_user.email in email_list:
        return True
    else:
        return False


@admin.route("/api/admin/user/<int:id>", methods=["DELETE"])
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

@admin.route("/api/admin/bets/<int:id>", methods=["DELETE"])
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

@admin.route("/api/admin/charities/<int:id>", methods=["DELETE"])
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

@admin.route("/api/admin/bets", methods=["GET"])
@login_required
def really_get_all_bets():
    if verify_user(current_user):
        bets = Bet.query.all()
        all_bets = []
        for bet in bets:
            bet = bet.make_dict()
            all_bets.append(bet)
        return jsonify({"data": all_bets}), 201

    else:
        return jsonify({"ERROR": "Not authorized to make this request"}), 401


@admin.route("/charities/form", methods = ["POST", "GET"])
@login_required
def post_charity():
    if verify_user(current_user):
        form = CharityForm()

        charity = Charity(name = form.name.data,
                          description=form.description.data,
                          email=form.email.data,
                          image=form.image.data,
                          website=form.website.data,
                          access_token=form.access_token.data,
                          amount_earned=form.amount_earned.data,
                          stripe_publishable_key=form.stripe_publishable_key.data,
                          stripe_user_id=form.stripe_user_id.data,
                          stripe_refresh_token=form.stripe_refresh_token.data)

        db.session.add(charity)
        db.session.commit()
        
        return render_template('charity_form.html', form = form)

    else:
        return jsonify({"ERROR": "Not authorized to make this request"}), 401
