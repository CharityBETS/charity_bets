from flask.ext.mail import Message
from charity_bets import mail
from flask import render_template, current_app
from threading import Thread
from flask.ext.login import current_user
from .models import User


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
    """Sends an email to a bet participant, notifying them that the other
    participant has claimed victory, and directs them to the bet page to
    either accept defeat or dispute the victory"""
    winner = User.query.filter_by(id = current_user.id).first()
    if winner.id == bet.creator:
        loser = User.query.filter_by(id = bet.challenger).first()
        winner_charity = bet.charity_creator
    else:
        loser = User.query.filter_by(id = bet.creator).first()
        winner_charity = bet.charity_challenger

    send_email("{} has claimed victory in your bet!".format(winner.name),
               "betsforcharity@gmail.com",
               [loser.email],
               render_template("did_you_lose_email.txt",
                                winner=winner, loser=loser, bet=bet,
                                winner_charity=winner_charity),
               render_template("did_you_lose_email.html",
                                winner=winner, loser=loser, bet=bet,
                                winner_charity=winner_charity))

def loss_claim_notification(bet):
    """Sends an email to the bet winner, notifying them that they have won."""
    loser = User.query.filter_by(id = current_user.id).first()
    if current_user.id == bet.creator:
        winner = User.query.filter_by(id = bet.challenger).first()
        winner_charity = bet.charity_challenger
    else:
        winner = User.query.filter_by(id = bet.creator).first()
        winner_charity = bet.charity_creator

    send_email("{} has accepted defeat in your bet!".format(loser.name),
               "betsforcharity@gmail.com",
               [winner.email],
               render_template("you_won_email.txt",
                                winner=winner, loser=loser, bet=bet,
                                winner_charity=winner_charity),
               render_template("you_won_email.html",
                                winner=winner, loser=loser, bet=bet,
                                winner_charity=winner_charity))

def you_lost_notification(bet):
    """Sends an email to the loser of the bet, notifying them that they have
    lost, and directs them to make payment to the winner's charity."""
    winner = User.query.filter_by(id = bet.verified_winner).first()
    if winner.id == bet.creator:
        loser = User.query.filter_by(id = bet.challenger).first()
        winner_charity = bet.charity_creator

    else:
        loser = User.query.filter_by(id = bet.creator).first()
        winner_charity = bet.charity_challenger

    send_email("You have lost your bet with {}!".format(winner.name),
               "betsforcharity@gmail.com",
               [loser.email],
               render_template("you_lost_email.txt",
                                winner=winner, loser=loser, bet=bet,
                                winner_charity=winner_charity),
               render_template("you_lost_email.html",
                                winner=winner, loser=loser, bet=bet,
                                winner_charity=winner_charity))

def disputed_bet_notification(bet):
    """Sends an email to both parties of the bet, notifying them that both
    parties have claimed victory and that the disputed bet results in no
    money going to the charity."""
    creator = User.query.filter_by(id = bet.creator).first()
    challenger = User.query.filter_by(id = bet.challenger).first()
    def send_disputed_email(bet, recipient, opponent):
        send_email("Your bet with {} cannot be resolved.".format(opponent.name),
                   "betsforcharity@gmail.com",
                   [recipient.email],
                   render_template("disputed_bet_email.txt",
                                    recipient=recipient, bet=bet,
                                    opponent=opponent),
                   render_template("disputed_bet_email.html",
                                    recipient=recipient, bet=bet,
                                    opponent=opponent))
    send_disputed_email(bet, creator, challenger)
    send_disputed_email(bet, challenger, creator)
