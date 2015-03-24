from flask import (session, Blueprint, url_for, request, redirect, flash,
                   render_template, jsonify)
from flask.ext.login import (current_user, abort, login_user,
                             logout_user, login_required)
from ..models import Charity
from ..extensions import db
from flask import current_app as app
import urllib
import requests
import stripe

charity_signup = Blueprint("charity_signup", __name__)


@charity_signup.route('/charity_signup')


def index():
    """Generates the webpage that charities will use to get stripe token"""
    return render_template('charity_signup.html')


@charity_signup.route('/authorize')
def authorize():
    """Rediects user to stripe signup website, which will return a stripe
    key for charging users on their behalf"""

    site = 'https://connect.stripe.com' + '/oauth/authorize'
    params = {'response_type': 'code',
              'scope': 'read_write',
              'client_id': app.config.get('CLIENT_ID')
             }
    url = site + '?' + urllib.parse.urlencode(params)
    return redirect(url)


@charity_signup.route('/oauth/callback')
def callback():
    """Sends application information and requests stripe key for the Stripe Connect
    user"""

    code  = request.args.get('code')
    data  = {'client_secret': app.config.get('CLIENT_SECRET'),
              'grant_type': 'authorization_code',
              'client_id': app.config.get('CLIENT_ID'),
              'code': code
             }
    url = 'https://connect.stripe.com' + '/oauth/token'
    resp = requests.post(url, params=data)
    resp = resp.json()
    token = resp['access_token']
    stripe.api_key = token
    email = stripe.Account.retrieve()["email"]

    # check to see if charity is already in the database
    duplicate = Charity.query.filter_by(email = email)
    if duplicate:
        duplicate.token = token
        db.session.commit()

    else:
        charity = Charity(token=token, email=email)
        db.session.add(charity)
        db.session.commit()

    return render_template('thank_you.html')
