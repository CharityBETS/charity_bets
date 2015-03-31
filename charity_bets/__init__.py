from flask import Flask, render_template

from . import models
from .extensions import db, migrate, config, oauth, assets, login_manager, mail
from .views.home import home
from .views.users import users
from .views.bets import bets
from .views.charities import charities
from .views.admin import admin
from .views.charity_signup import charity_signup
from flask_sslify import SSLify




def create_app():
    app = Flask(__name__)
    sslify = SSLify(app)
    app.config.from_pyfile('config.cfg')

    app.config['DEBUG']
    app.config['SECRET_KEY']
    app.config['FACEBOOK']
    app.config['MAIL_SERVER']
    app.config['MAIL_PORT']
    app.config['MAIL_USE_TLS']
    app.config['MAIL_USE_SSL']
    app.config['MAIL_USERNAME']
    app.config['MAIL_PASSWORD']
    app.config['CLIENT_SECRET']
    app.config['CLIENT_ID']

    app.register_blueprint(home)
    app.register_blueprint(users)
    app.register_blueprint(admin)
    app.register_blueprint(charities, url_prefix='/api')
    app.register_blueprint(charity_signup)
    app.register_blueprint(bets, url_prefix='/api')

    config.init_app(app)
    oauth.init_app(app)
    assets.init_app(app)
    mail.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    return app
