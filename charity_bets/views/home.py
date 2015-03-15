from flask import Blueprint, flash


home = Blueprint("home", __name__, static_folder="./static")


@home.route("/")
def index():
    return home.send_static_file("index.html")


## Add your API views here
