from .extensions import db, login_manager
from flask.ext.login import UserMixin, current_user

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True, nullable=False)
    facebook_id = db.Column(db.String(255), unique=True, nullable=False)
    bank_token = db.Column(db.String(255))
    charity_id = db.Column(db.Integer)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)
    money_lost = db.Column(db.Integer, default=0)
    money_won = db.Column(db.Integer, default=0)

    def make_dict(self):
        return {"id": self.id,
                "name": self.name,
                "email": self.email,
                "facebook_id": self.facebook_id,
                "bank_token": self.bank_token,
                "charity": self.charity_id,
                "wins": self.wins,
                "losses": self.losses,
                "money_lost": self.money_lost,
                "money_won": self.money_won}


class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))
    status = db.Column(db.String(255), default="pending", nullable=False)
    amount = db.Column(db.String(255), nullable=False)
    date = db.Column(db.String(255))
    location = db.Column(db.String(255))
    creator = db.Column(db.Integer)
    challenger = db.Column(db.Integer)
    creator_outcome = db.Column(db.String(255))
    challenger_outcome = db.Column(db.String(255))
    challenger_name = db.Column(db.String(255))
    challenger_facebook_id = db.Column(db.String(255))
    creator_name = db.Column(db.String(255))
    creator_facebook_id = db.Column(db.String(255))


    def make_dict(self):
        return {"id": self.id,
                "title": self.title,
                "description": self.description,
                "status": self.status,
                "amount": self.amount,
                "date": self.date,
                "location":self.location,
                "creator":self.creator,
                "challenger":self.challenger,
                "creator_outcome": self.creator_outcome,
                "challenger_outcome": self.challenger_outcome,
                "challenger_name":self.challenger_name,
                "challenger_facebook_id": self.challenger_facebook_id,
                "creator_name": self.creator_name,
                "creator_facebook_id": self.creator_facebook_id}


class UserBet(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    bet_id = db.Column(db.Integer)


class Charity(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True)
    recipient_token = db.Column(db.String(255), nullable=False)

    def make_dict(self):
        return {"id": self.id,
                "name": self.name,
                "description": self.description,
                "email": self.email,
                "recipient_token": self.recipient_token}
