from taskTrakerAppV1 import db
from flask_login import UserMixin
from sqlalchemy import JSON

class Users(UserMixin,db.Model):
    id=db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    sections = db.Column(JSON)
    role = db.Column(db.String(15))
