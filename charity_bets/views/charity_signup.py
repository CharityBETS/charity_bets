from flask import session, Blueprint, url_for, request, redirect, flash, render_template, jsonify
from flask.ext.login import current_user, abort, login_user, logout_user, login_required
from ..models import Charity
from ..extensions import db
from flask import current_app as app
import urllib
import requests


charity_signup = Blueprint("charity_signup", __name__)

# might need to take out publishable key here, decide later
@charity_signup.route('/charity_signup')
def index():
  return render_template('charity_signup.html')


@charity_signup.route('/authorize')
def authorize():
  site  = 'https://connect.stripe.com' + '/oauth/authorize'
  params = {
             'response_type': 'code',
             'scope': 'read_write',
             'client_id': app.config.get('CLIENT_ID')
           }

  # Redirect to Stripe /oauth/authorize endpoint
  url = site + '?' + urllib.parse.urlencode(params)
  return redirect(url)

@charity_signup.route('/oauth/callback')
def callback():
  code   = request.args.get('code')
  data   = {
             'client_secret': app.config.get('CLIENT_SECRET'),
             'grant_type': 'authorization_code',
             'client_id': app.config.get('CLIENT_ID'),
             'code': code
           }

  # Make /oauth/token endpoint POST request
  url = 'https://connect.stripe.com' + '/oauth/token'
  resp = requests.post(url, params=data)
  print(resp)
  resp = resp.json()
  token = resp['access_token']
  charity = Charity(token = token)
  db.session.add(charity)
  db.session.commit()
  return render_template('thank_you.html', token=token)