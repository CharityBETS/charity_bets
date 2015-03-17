from flask import Flask, render_template

from . import models
from .extensions import db, migrate, config, oauth, assets, login_manager, mail
# from .views.views import coaction
from .views.home import home
from .views.users import users
from .views.bets import bets


MAIL_SERVER = 'smtp.googlemail.com'
MAIL_PORT = 465
MAIL_USE_TLS = False
MAIL_USE_SSL = True
MAIL_USERNAME = "xxxx@gmail.com"
MAIL_PASSWORD = "xxxx"


def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('config.cfg')

    app.config['DEBUG']
    app.config['SECRET_KEY']
    app.config['FACEBOOK']


    app.register_blueprint(home)
    app.register_blueprint(users)
    app.register_blueprint(bets, url_prefix='/api')

    config.init_app(app)
    oauth.init_app(app)
    assets.init_app(app)
    mail.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    return app
