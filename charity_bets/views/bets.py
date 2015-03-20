from functools import wraps
from ..models import Bet, UserBet, User, Comment
from flask import session, Blueprint, url_for, request, redirect, flash, render_template, jsonify
from ..forms import BetForm, CommentForm
from flask.ext.login import current_user, login_required
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

def bet_aggregator(bets, bet_list):
    for a_bet in bets:
        bet = Bet.query.filter_by(id=a_bet.id).first()
        if bet:
            bet_list.append(bet)
    return bet_list


@bets.route("/user/<int:id>/bets", methods = ["GET"])
def view_users_bets(id):
    creator_bets = Bet.query.filter_by(creator=id).all()
    challenger_bets = Bet.query.filter_by(challenger=id).all()
    bet_list = []
    bet_list = bet_aggregator(creator_bets, bet_list)
    bet_list = bet_aggregator(challenger_bets, bet_list)
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
    comments = Comment.query.filter_by(bet_id=id).all()
    all_comments = []
    if bet:
        bet = bet.make_dict()
        for comment in comments:
            comment = comment.make_dict()
            print(comment)
            all_comments.append(comment)
        print(all_comments)
        bet["comments"] = all_comments
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
                return jsonify({"data": bet.make_dict()}), 201

            else:
                setattr(bet, key, data[key])

        db.session.commit()
        return jsonify({"data": bet.make_dict()}), 201

    else:
        return jsonify({"ERROR": "Bet is not in database"})


@bets.route("/bets/<int:id>/comments", methods = ["POST"])
def view_comments(id):
    bet = Bet.query.filter_by(id = id).first()
    body = request.get_data(as_text=True)
    data = json.loads(body)
    form = CommentForm( comment=data['comment'],
                        formdata=None, csrf_enabled=False)
    if form.validate():
        user_comment = Comment(comment = form.comment.data,
                               user_id = current_user.id,
                               bet_id = bet.id)

        db.session.add(user_comment)
        db.session.commit()

        user_comment = user_comment.make_dict()

        return jsonify({ 'data': user_comment }), 201

    else:
        return jsonify({"ERROR": "No comments yet"})

    # bet = Bet.query.filter_by(id = id).first()
    # comment = Comment.query.filter_by(id = id).first()
    # comment_list = []
    # if len(comment_list) != None:
    #     comments = [comment.make_dict() for comment in comment_list]
    #     return jsonify({"data": comments}), 201
    # else:
    #     return jsonify({"ERROR": "No comments yet"})


def edit_generator():
    edits = []
