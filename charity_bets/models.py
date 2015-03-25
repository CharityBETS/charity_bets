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
    win_streak = db.Column(db.Integer, default=0)
    bet_conflicts = db.Column(db.Integer, default=0)
    bets_made = db.Column(db.Integer, default=0)

    def make_dict(self):
        return {"id": self.id,
                "name": self.name,
                "email": self.email,
                "facebook_id": self.facebook_id,
                "bank_token": self.bank_token,
                "charity_id": self.charity_id,
                "wins": self.wins,
                "losses": self.losses,
                "money_lost": self.money_lost,
                "money_won": self.money_won,
                "win_streak": self.win_streak,
                "bet_conflicts": self.bet_conflicts,
                "bets_made": self.bets_made}


class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))
    status = db.Column(db.String(255), default="pending", nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(255))
    location = db.Column(db.String(255))
    creator = db.Column(db.Integer)
    challenger = db.Column(db.Integer)
    creator_outcome = db.Column(db.Integer)
    challenger_outcome = db.Column(db.Integer)
    challenger_name = db.Column(db.String(255))
    challenger_facebook_id = db.Column(db.String(255))
    creator_name = db.Column(db.String(255))
    creator_facebook_id = db.Column(db.String(255))
    verified_winner = db.Column(db.Integer)
    verified_loser = db.Column(db.Integer)
    loser_paid = db.Column(db.String(255))
    charity_creator = db.Column(db.String(255))
    charity_challenger = db.Column(db.String(255))
    charity_creator_id = db.Column(db.Integer)
    charity_challenger_id = db.Column(db.Integer)
    mail_track = db.Column(db.String(255))


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
                "creator_facebook_id": self.creator_facebook_id,
                "verified_winner": self.verified_winner,
                "verified_loser": self.verified_loser,
                "loser_paid": self.loser_paid,
                "charity_creator": self.charity_creator,
                "charity_challenger": self.charity_challenger,
                "charity_creator_id": self.charity_creator_id,
                "charity_challenger_id": self.charity_challenger_id,
                "mail_track": self.mail_track}


class UserBet(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    bet_id = db.Column(db.Integer)


class Charity(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    description = db.Column(db.String(255))
    email = db.Column(db.String(255))
    token = db.Column(db.String(255))
    image = db.Column(db.String(255))
    website = db.Column(db.String(255))
    amount_earned = db.Column(db.Integer, default=0)

    def make_dict(self):
        return {"id": self.id,
                "name": self.name,
                "description": self.description,
                "email": self.email,
                "token": self.token,
                "image": self.image,
                "website": self.website,
                "amount_earned": self.amount_earned}


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    bet_id = db.Column(db.Integer)
    comment = db.Column(db.String(255))
    name = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime)

    def make_dict(self):
        return {"id": self.id,
                "user_id": self.user_id,
                "bet_id": self.bet_id,
                "comment": self.comment,
                "name": self.name,
                "timestamp": self.timestamp}


# To be used when we implement crowd sourcing, we'll filter by verified_loser &
# bet.id, and then charge them for the amount we stored at time of authorization

# class Funder(db.model):
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     is_funding: = db.Column(db.Integer)
#     bet_id = db.Column(db.Integer)
#     email = db.Column(db.String)
#     amount = db.Column(db.String)
#     stripe_customer_id = db.Column(db.Integer)
#     charity = db.Column(db.String)
#     charity_token = db.Column(db.String)

    # def make_dict(self):
    #     return {"id": self.id,
    #             "is_funding": self.is_funding,
    #             "email": self.email,
    #             "amount": self.comment,
    #             "timestamp": self.timestamp,
    #             "charity": self.charity}
