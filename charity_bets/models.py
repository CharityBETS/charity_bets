from .extensions import db



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True, nullable=False)
    bank_token = db.Column(db.String(255))
    charity_id = db.Column(db.Integer)

    def make_dict(self):
        return {"id": self.id,
                "name": self.name,
                "email": self.email,
                "bank_token": self.bank_token,
                "charity": self.charity_id}


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

    def make_dict(self):
        return {"id": self.id,
                "title": self.title,
                "description": self.description,
                "status": self.status,
                "amount": self.amount,
                "date": self.date,
                "location":self.location,
                "creator":self.creator,
                "challenger":self.challenger}

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
