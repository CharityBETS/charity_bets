#!/usr/bin/env python
import os

from flask.ext.script import Manager, Shell, Server
from flask.ext.migrate import MigrateCommand
from flask.ext.script.commands import ShowUrls, Clean
from charity_bets.models import User

from charity_bets import create_app, db
from charity_bets.models import User, Charity


app = create_app()
manager = Manager(app)
manager.add_command('server', Server())
manager.add_command('db', MigrateCommand)
manager.add_command('show-urls', ShowUrls())
manager.add_command('clean', Clean())


@manager.shell
def make_shell_context():
    """ Creates a python REPL with several default imports
        in the context of the app
    """

    return dict(app=app, db=db)


@manager.command
def createdb():
    """Creates the database with all model tables.
    Migrations are preferred."""
    db.create_all()

@manager.command
def seed():
    user_seed_data = [{
                    'name': "Betti",
                    'email': "betsforcharity@gmail.com",
                    'facebook_id': "1384281321892330"
                    },
                    {
                    'name': "Daniel Newell",
                    'email': "dknewell1@gmail.com",
                    'facebook_id': "10101587473382708"
                    },
                    {
                    'name': "Tom Rau",
                    'email': "tomrau@gmail.com",
                    'facebook_id': "10153291816102240"
                    },
                    {
                    'name': "Ben Batty",
                    'email': "battybenjamin@gmail.com",
                    'facebook_id': "10153168971512790"
                    },
                    {
                    'name': "Bret Runestad",
                    'email': "bret.runestad@gmail.com",
                    'facebook_id': "10100983997732464"
                    },
                    {
                    'name': "Jose Maria Olazabal Jesus Christos",
                    'email': "notarealemail@gmail.com",
                    'facebook_id': "10100983997732465"
                    }
                    ]
    for seed in user_seed_data:
        user = User.query.filter_by(email=seed['email']).first()
        if not user:
            user=User(name=seed['name'],
                      facebook_id=seed['facebook_id'],
                      email=seed['email']
                            )
            db.session.add(user)
    db.session.commit()
    print("You've added some major wagerers as users.")

@manager.command
def charity_seed():
    charity_seed_data = [
                    {
                    'name': "Meals on Wheels of Durham (ben)",
                    'description': "Meals on Wheels of Durham delivers a nutritious meal, a safety check and the smile that serve as a lifeline to seniors of limited mobility. This combination goes well beyond fighting the battle against the hunger that threatens one in six of America’s seniors – it provides the support and peace of mind that enable them to remain safely and securely in their own homes as they continue to age. Enabling seniors to stay in their own homes means they remain happier, extend their independence and can stay connected to the communities and surroundings that provide them comfort. The powerful side effect of this result is that it means seniors can stay out of expensive nursing facilities and hospitals.",
                    'email': "info@mowdurham.org",
                    'access_token': "sk_test_8H01iPxORNegr3wWFhm9sU6G",
                    'image': "https://s3-us-west-2.amazonaws.com/betti/MealsonWheels-2014-logo.png",
                    'website': "http://www.mowdurham.org/"
                    },
                    {
                    'name': "Kids With Faces (ben)",
                    'email': "kidswithfaces@notanemail.com",
                    'description': "sadly, at this time we cannot serve kids without faces",
                    'access_token': "sk_test_8H01iPxORNegr3wWFhm9sU6G"
                    },
                    {
                    'name': "Girl Scouts (daniel)",
                    'email': "dknewell1@gmail.com",
                    'description': "Buy our cookies!",
                    'access_token': "sk_test_nuOUpuXCOa6EXXtcBmHeWb36"
                    },
                    {
                    'name': "The Human Fund (bret)",
                    'email': "georgecostanza@seinfeldjoke.com",
                    'description': "Have younger people watched Seinfeld?",
                    'access_token': "sk_test_q4G07kp7KTix0KCQPU7GnyFk"
                    },
                    {
                    'name': "The Bret Fund(bret)",
                    'email': "bret.runestad@gmail.com",
                    'description': "The money just goes right to Bret.  He deserves this.",
                    'access_token': "sk_test_q4G07kp7KTix0KCQPU7GnyFk"
                    }
                    ]

    for seed in charity_seed_data:
        charity = Charity.query.filter_by(email=seed['email']).first()
        if not charity:
            charity=Charity(name=seed['name'],
                            access_token=seed['access_token'],
                            email=seed['email'],
                            description = seed['description']
                            )
            db.session.add(charity)
    db.session.commit()
    print("You've added some VERY fake charities.")

@manager.command
def clear_charities():
    charities = Charity.query.all()
    for charity in charities:
        db.session.delete(charity)
    db.session.commit()
    print("You've cleared out all of the charities.")

if __name__ == '__main__':
    manager.run()
