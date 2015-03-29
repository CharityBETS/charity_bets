from flask_wtf import Form
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired


class BetForm(Form):
    title = StringField('title', validators=[DataRequired()])
    amount = IntegerField('amount', validators=[DataRequired()])
    charity_creator = StringField('charity_creator', validators=[DataRequired()])


class CommentForm(Form):
    comment = StringField('comment')


class CharityForm(Form):
    name = StringField('name')
    description = StringField('description')
    email = StringField('email')
    image = StringField('image')
    website = StringField('website')
    access_token = StringField('access_token')
    amount_earned = IntegerField('amount_earned')
    stripe_publishable_key = StringField('stripe_publishable_key')
    stripe_user_id = StringField('stripe_user_id')
    stripe_refresh_token = StringField('stripe_refresh_token')
