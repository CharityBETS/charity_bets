from flask import Flask, render_template
import os
from . import models
from .extensions import db, migrate, config, oauth, assets, login_manager, mail
# from .views.views import coaction
from .views.home import home
from .views.users import users
from .views.bets import bets
from .views.charities import charities
from .views.charity_signup import charity_signup

def create_app():
    app = Flask(__name__)
    app.config.from_object(__name__)

    app.config['DEBUG'] = os.environ['DEBUG']
    app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
    app.config['FACEBOOK'] = os.environ['FACEBOOK']
    app.config['MAIL_SERVER'] = os.environ['MAIL_SERVER']
    app.config['MAIL_PORT'] = os.environ['MAIL_PORT']
    app.config['MAIL_USE_TLS'] = os.environ['MAIL_USE_TLS']
    app.config['MAIL_USE_SSL'] = os.environ['MAIL_USE_SSL']
    app.config['MAIL_USERNAME'] = os.environ['MAIL_USERNAME']
    app.config['MAIL_PASSWORD'] = os.environ['MAIL_PASSWORD']

    app.register_blueprint(home)
    app.register_blueprint(users)
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
