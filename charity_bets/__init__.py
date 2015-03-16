from flask import Flask, render_template

from . import models
from .extensions import db, migrate, config, oauth, assets
# from .views.views import coaction
from .views.home import home
from .views.users import users

SQLALCHEMY_DATABASE_URI = "sqlite:////tmp/coaction.db"
DEBUG = True
SECRET_KEY = 'development-key'
FACEBOOK={'consumer_key': '1417359091908563','consumer_secret': 'f129f7b34d7b57201da77f5ea0432a45'}


def create_app():
    app = Flask(__name__)
    app.config.from_object(__name__)
    app.register_blueprint(home)
    app.register_blueprint(users)

    config.init_app(app)
    oauth.init_app(app)
    assets.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)

    return app
