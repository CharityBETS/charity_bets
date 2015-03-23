# -*- coding: utf-8 -*-
"""Extensions module."""

from flask.ext.sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask.ext.migrate import Migrate
migrate = Migrate()

# Change this to HerokuConfig if using Heroku.
from flask.ext.appconfig import HerokuConfig
config = HerokuConfig()

from flask_oauthlib.client import OAuth
oauth = OAuth()

from flask.ext.assets import Environment
assets = Environment()

from flask.ext.login import LoginManager
login_manager = LoginManager()

from flask_mail import Mail
mail = Mail()
