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


def win_claim_notification(creator, challenger, bet):
    send_email("{} has claimed victory in your bet!",
               "betsforcharity@gmail.com",
               [creator.email],
               render_template("new_bet_email.txt",
                               creator=creator, challenger=challenger, bet=bet),
               render_template("new_bet_email.html",
                               creator=creator, challenger=challenger, bet=bet))

def loss_claim_notification(creator, challenger, bet):
    send_email("{} has accepted defeat in your bet!".format(creator.name),
               "betsforcharity@gmail.com",
               [creator.email],
               render_template("new_bet_email.txt",
                               creator=creator, challenger=challenger, bet=bet),
               render_template("new_bet_email.html",
                               creator=creator, challenger=challenger, bet=bet))
