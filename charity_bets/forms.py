from flask_wtf import Form
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired


class BetForm(Form):
    title = StringField('title', validators=[DataRequired()])
    amount = IntegerField('amount', validators=[DataRequired()])


class CommentForm(Form):
    comment = StringField('comment')
