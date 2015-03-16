from flask import Flask, render_template

from . import models
from .extensions import db, migrate, config, oauth, assets
# from .views.views import coaction
from .views.home import home
from .views.users import users


def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('config.cfg')

    app.config['DEBUG']
    app.config['SECRET_KEY']
    app.config['FACEBOOK']

    app.register_blueprint(home)
    app.register_blueprint(users)

    config.init_app(app)
    oauth.init_app(app)
    assets.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)

    return app
