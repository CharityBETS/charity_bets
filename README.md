# Coaction

Lots of companies need collaboration tools. Unfortunately, these are usually really complicated, and for non-technical users, they are daunting. We want to build a collaboration tool that helps people track and collaborate on tasks without requiring tons of technical expertise. And we _don't_ want to overwhelm them with lots of bells and whistles.

This collaboration tool will be made of two parts:

* A single-page application in Angular
* A REST API built with Python and Flask

## Normal Mode

Users can:

* Register for a new account
* Login with their account
* Create new tasks
  * Assign the new task to someone (from a list of current users)
* See an overview of all incomplete tasks in the system
* See tasks assigned to them
* See all tasks they've assigned to others
* Identify overdue tasks. These should have a visual identifier everywhere they are present.
* Mark their tasks as started or complete
* Reassign tasks assigned to them to others
* Comment on tasks

Tasks must have:

* a title
* a description
* a status ("new", "started", or "done")
* an assignee

Tasks can have:

* a due date (stored in UTC)
* comments

### Thoughts about UI and UX

* The UI should be responsive (e.g. look good on mobile and desktop).
* The UI should represent new, doing, and done tasks logically
* Think about the persona of the end-user
  * How can you represent a task as simply as possible?
  * What is a users' primary concern?
  * What do they most want to see when logging in?
  * What other personas might there be? Managers? What would their landing page look like?

### Note about authentication

Authentication should be done with cookie-based sessions. The cookies will have to be created through Flask, so there should be an API endpoint that logs in users.

## Hard Mode

For hard mode, you can choose one or more of the following:

* Add the ability to add a list of todos to a task
  * Users can edit/remove todos
  * Users can check off a todo in order to mark it as completed
* Users can see a chart of the amount of todos they have completed over time
  * They can also see other stats, like the amount they've created, and the amount "in-flight" (started but not completed)
  * These stats should be available for the entire organization
* Tasks can be assigned to people that don't yet have an account by using their email address. That new person who does not yet have an account will get an email with a link to let them create an account.
* Tasks can have attachments (images, files). Because you're going to deploy to Heroku, these should be stored in S3.

---

## Setup for front-end students

### Front end code

You need to run `npm install`

From that point on, you can just run `gulp` to run in development mode.

Run `gulp release` to build a minified, bundled, optimized version of your code.

The `dist` folder is now `coaction/static`.

All of your URLs (including Angular template URLs) should begin with static.
(e.g. 'static/my-directive/my-directive.html')

Live-reload is working, but is a wee smidge different. You'll need this Chrome
extension installed:

https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en

### Python

In order to see your HTML, CSS, and JavaScript, you will need to run Python. The version we use is not the same as the one on your system, so you'll have to install it. Here's what you do:

1. Run `brew install python3`.
2. In the `coaction` folder, run `pip3 install -r requirements.txt`. This installs all the Python packages we need.

That's it!

When you're ready to run the application, from the `coaction` folder run `python3 manage.py server`.

**NOTE**: This is different from how the Python students run this. We've simplified it in your case.

### Databases

You'll need a database for this project. We've set it up so it should be easy. The Python students on your project will be able to help you with this.

---

## Deliverables

Once you have your application ready -- or long before -- it should be deployed to Heroku. Python students, you are in charge of this part!

---

## Resources

* [JSend](http://labs.omniti.com/labs/jsend). You need to decide what the JSON you send back and forth will look like. This is an incredibly simple format that will serve you well.
* [Marshmellow](https://marshmallow.readthedocs.org/en/latest/). This library can convert your database models to JSON, JSON back into models, and also validate your data! Slim down your application: eat a marshmellow! Make sure to [look at their SQLAlchemy example](https://marshmallow.readthedocs.org/en/latest/examples.html#quotes-api-flask-sqlalchemy).
* [pytest-flask](https://pypi.python.org/pypi/pytest-flask). You should test your API endpoints! It's a lot easier than it used to be with pytest-flask. I've already done the hard part for you.
* If you're going to try to upload files to S3:
  * Try [Flask-Store](http://flask-store.soon.build/en/latest/)
  * If that doesn't work, check out https://github.com/doobeh/Flask-S3-Uploader and https://devcenter.heroku.com/articles/s3-upload-python
* [Vega](https://trifacta.github.io/vega/). A simplified interface on top of D3 for charting. [NVD3](http://nvd3.org/) is another option.
