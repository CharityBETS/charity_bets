from ..models import Bet, UserBet, User, Comment, Charity
from flask import session, Blueprint, request, jsonify
from flask.ext.login import current_user, login_required
from ..extensions import db
from .fake_bet import fake_charity
import json
from ..forms import CharityForm
from .admin import verify_user

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


@charities.route("/charities/<int:id>", methods=["PUT"])
@login_required
def edit_charity(id):
    if verify_user(current_user):
        charity = Charity.query.filter_by(id = id).first()
        if charity:
            body = request.get_data(as_text=True)
            data = json.loads(body)
            keys = data.keys()
        for key in keys:
            if key == "delete":
                db.session.delete(charity)
                db.session.commit()
                return jsonify({"data":"charity_deleted"})
            else:
                setattr(charity, key, data[key])
                db.session.commit()
                return jsonify({"data":charity.make_dict()})
        else:
            return jsonify({"data":"Charity doesn't exist"})
    else:
        return jsonify({"ERROR": "Not authorized to make this request"}), 401

@charities.route("/charities/form", methods = ["POST"])
@login_required
def post_charity():
    body = request.get_data(as_text=True)
    data = json.loads(body)
    form = CharityForm( name=data['name'],
                        description=data['description'],
                        email=data['email'],
                        image=data['image'],
                        website=data['website'],
                        access_token=data['access_token'],
                        amount_earned=data['amount_earned'],
                        stripe_publishable_key=data['stripe_publishable_key'],
                        stripe_user_id=data['stripe_user_id'],
                        stripe_refresh_token=data['stripe_refresh_token'],
                        formdata=None, csrf_enabled=False)
    if form.validate():
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

        charity = charity.make_dict()

        return jsonify({ 'data': charity }), 201

    else:
        return jsonify({"ERROR": "You did not enter a charity"})
