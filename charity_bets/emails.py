from flask.ext.mail import Message
from charity_bets import mail
from flask import render_template

def send_email(subject, sender, recipients, text_body, html_body):
    message = Message(subject, sender=sender, recipients=recipients)
    message.body = text_body
    message.html = html_body
    mail.send(message)

def bet_creation_notification(creator, challenger, bet):
    send_email("You've been challenged to a bet!",
               "betsforcharity@gmail.com",
               [creator.email],
               render_template("new_bet_email.txt",
                               creator=creator, challenger=challenger, bet=bet),
               render_template("new_bet_email.html",
                               creator=creator, challenger=challenger, bet=bet))
