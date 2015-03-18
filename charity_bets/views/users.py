from functools import wraps

from flask import session, Blueprint, url_for, request, redirect, flash, render_template, jsonify
from flask.ext.login import current_user, abort, login_user, logout_user, login_required
import json


from ..extensions import oauth, db
from ..models import User


facebook = oauth.remote_app('facebook',
    base_url='https://graph.facebook.com/',
    request_token_url=None,
    access_token_url='/oauth/access_token',
    authorize_url='https://www.facebook.com/dialog/oauth',
    app_key="FACEBOOK",
    request_token_params={'scope': 'email, public_profile'}
)

@facebook.tokengetter
def get_facebook_token(token=None):
    return session.get('facebook_token')


def require_login(view):
    @wraps(view)
    def decorated_view(*args, **kwargs):
        if 'facebook_token' in session:
            return view(*args, **kwargs)
        else:
            return redirect(url_for("users.login"))

    return decorated_view

users = Blueprint("users", __name__)


@users.route("/facebook/login")
def facebook_login():
    session.pop('facebook_token', None)
    return facebook.authorize(callback=url_for('.facebook_authorized',
                                             _external=True,
                                             next=request.args.get('next')
                                            #  or url_for("repolister.index")
                                             ))


@users.route('/login/facebook/authorized', methods=["GET", "POST"])
def facebook_authorized():
    next_url = "http://espn.go.com/"
    # next_url = request.args.get('next') or url_for('repolister.index')
    resp = facebook.authorized_response()
    if resp is None:
        flash('You denied the request to sign in.')
        return redirect(next_url)

    session['facebook_token'] = (resp['access_token'],)
    me = facebook.get('/me')
    session['facebook_name'] = me.data['first_name']
    user = User.query.filter_by(email=me.data['email']).first()
    if user:
        print("user already exists")
    else:
        user = User(name=me.data['name'],
                    email=me.data['email'],
                    facebook_id=me.data['id']
                    )
        db.session.add(user)
        db.session.commit()

    login_user(user)
        # return {"message": "You have been registered and logged in"}

    flash('You were signed in as %s' % repr(me.data['email']))
    return redirect('/#createbet')

@users.route("/logout")
def logout():
    logout_user()
    session.pop('facebook_token', None)
    return redirect('/#/')

# @users.route("/api/logout", methods = ["POST"])
# def logout():
#     logout_user()
#     session.pop('facebook_token', None)
#     return jsonify({"result": "logged out"}), 201

@users.route("/api/users", methods = ["GET"])
def view_all_users():
    users = User.query.all()
    users = [user.make_dict() for user in users]
    if users:
        return jsonify({'data': users}), 201
    else:
        return jsonify({"ERROR": "No users available."}), 401


@users.route("/api/user/<int:id>", methods = ["GET"])
def view_user(id):
    user = User.query.filter_by(id = id).first()
    if user:
        user = user.make_dict()
        del user['bank_token']
        return jsonify({'data': user})
    else:
        return jsonify({"ERROR": "User does not exist."}), 401


@users.route("/api/user/me", methods = ["GET"])
def get_current_user():
    user = User.query.filter_by(id = current_user.id).first()
    if user:
        user = user.make_dict()
    return jsonify({'data': user})
