from ..models import Bet, User, Charity
from flask.ext.login import current_user

def fake_bet():
    betti = User.query.filter_by(email="betsforcharity@gmail.com").first()
    fake_bet = Bet(title="Sample Bet",
                  id = 0,
                  amount=20,
                  creator = betti.id,
                  challenger = current_user.id,
                  challenger_name = current_user.name,
                  challenger_facebook_id = current_user.facebook_id,
                  challenger_outcome = current_user.id,
                  charity_challenger = "The charity of your choice",
                  charity_challenger_id = 999,
                  creator_name = "Betti",
                  creator_facebook_id = betti.facebook_id,
                  creator_outcome = current_user.id,
                  charity_creator = "The Human Fund",
                  charity_creator_id = 2,
                  status = "complete",
                  date = "2020-01-01T04:00:00.000Z",
                  description = "More details about your bet!",
                  location = "The place where your bet will happen",
                #   verified_winner = current_user.id,
                #   verified_loser = betti.id,
                #   winner_name = current_user.name
                  )
    return fake_bet

def fake_charity():
    fake_charity = Charity(name="Sample Charity",
                           id=0)
    return fake_charity
