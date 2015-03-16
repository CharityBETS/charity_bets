from flask_wtf import Form
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired


class BetForm(Form):
    title = StringField('title', validators = [DataRequired()])
    description = StringField('description', validators = [DataRequired()])
    amount = IntegerField('amount', validators = [DataRequired()])
