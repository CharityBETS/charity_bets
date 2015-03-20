from flask.ext.mail import Message
from charity_bets import mail
from flask import render_template, current_app
from threading import Thread


def send_async_email(app, message):
    with app.app_context():
        mail.send(message)

def send_email(subject, sender, recipients, text_body, html_body):
    app = current_app._get_current_object()
    message = Message(subject, sender=sender, recipients=recipients)
    message.body = text_body
    message.html = html_body
    thr = Thread(target=send_async_email, args=[app, message])
    thr.start()
    return thr

def bet_creation_notification(creator, challenger, bet):
    send_email("You've been challenged to a bet!",
               "betsforcharity@gmail.com",
               [creator.email],
               render_template("new_bet_email.txt",
                               creator=creator, challenger=challenger, bet=bet),
               render_template("new_bet_email.html",
                               creator=creator, challenger=challenger, bet=bet))


def win_claim_notification(bet):
    winner = User.query.filter_by(id = current_user.id).first()
    if current_user.id == creator.id:
        loser = User.query.filter_by(id = challenger.id).first()
    else:
        loser = User.query.filter_by(id = creator.id).first()

    send_email("{} has claimed victory in your bet!".format(winner.name),
               "betsforcharity@gmail.com",
               [loser.email],
               render_template("you_lost_email.txt",
                                winner=winner, loser=loser, bet=bet),
               render_template("you_lost_email.html",
                                winner=winner, loser=loser, bet=bet))

def loss_claim_notification(bet):
    loser = User.query.filter_by(id = current_user.id).first()
    if current_user.id == creator.id:
        winner = User.query.filter_by(id = challenger.id).first()
    else:
        winner = User.query.filter_by(id = creator.id).first()

    send_email("{} has accepted defeat in your bet!".format(loser.name),
               "betsforcharity@gmail.com",
               [winner.email],
               render_template("you_won_email.txt",
                                winner=winner, loser=loser, bet=bet),
               render_template("you_won_email.html",
                                winner=winner, loser=loser, bet=bet))
