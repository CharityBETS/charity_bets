#!/usr/bin/env python
import os

from flask.ext.script import Manager, Shell, Server
from flask.ext.migrate import MigrateCommand
from flask.ext.script.commands import ShowUrls, Clean
from charity_bets.models import User

from charity_bets import create_app, db
from charity_bets.models import User


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
                    'name': "Daniel Newell",
                    'email': "dn78685@appstate.edu",
                    'facebook_id': "10101587473382708"
                    },
                    {
                    'name': "Tom Rau",
                    'email': "tomrau@gmail.com",
                    'facebook_id': "10153291816102240"
                    },
                    {
                    'name': "Ben Batty",
                    'email': "bbatty32@yahoo.com",
                    'facebook_id': "1015316897151279"
                    },
                    {
                    'name': "Bret Runestad",
                    'email': "bret.runestad@gmail.com",
                    'facebook_id': "10100983997732464"
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

if __name__ == '__main__':
    manager.run()
