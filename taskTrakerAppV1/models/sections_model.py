from taskTrakerAppV1 import db

from sqlalchemy import Integer, String, DateTime, JSON, Boolean
from datetime import datetime, timezone

class Tasks (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(String)
    task_description = db.Column(String)
    assign_section = db.Column(db.Integer, db.ForeignKey('sections.id'))
    

    association_task = db.relationship("Tasks_Items", back_populates="task")
    section = db.relationship("Sections", back_populates="tasks")
    

class Sections(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    section_name = db.Column(String, index=True)
    section_order_indx = db.Column(Integer)
    
    tasks = db.relationship("Tasks",back_populates='section')
    association_section = db.relationship("Items_Sections", back_populates="section")


class Tasks_Items (db.Model):
    id = db.Column(db.Integer, primary_key=True)

    is_completed = db.Column(Boolean, default=False)

    item_id = db.Column(db.Integer, db.ForeignKey('items.id'))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))

    item = db.relationship("Items", back_populates="association_task")
    task =  db.relationship("Tasks", back_populates="association_task")

class Items (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    article_number = db.Column(String)
    upholstery = db.Column(String)
    quantity = db.Column(String)
    condition = db.Column(String)
    trolley = db.Column(String)
    notes = db.Column(String)
    is_completed = db.Column(Boolean, default=False)
    start_time = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    end_time = db.Column(DateTime(timezone=True))
    total_duration = db.Column(Integer)
    item_type = db.Column(String)


    association_section = db.relationship("Items_Sections", back_populates="item")
    association_task = db.relationship("Tasks_Items", back_populates="item")


class Items_Sections(db.Model):
    __tablename__ = 'items_sections'
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'))
    section_id = db.Column(db.Integer, db.ForeignKey('sections.id'))

    order_of_workflow = db.Column(Integer)
    pauses_record = db.Column(JSON)
    start_time = db.Column(DateTime(timezone=True))
    end_time = db.Column(DateTime(timezone=True))
    total_duration = db.Column(Integer)
    is_completed = db.Column(Boolean, default=False)
    is_visible = db.Column(Boolean, default=False)
    is_paused = db.Column(Boolean, default=False)

    item = db.relationship("Items", back_populates="association_section")
    section = db.relationship("Sections", back_populates="association_section")
    pauses = db.relationship('Items_Sections_Pauses', back_populates= "association_section")
    


class Items_Sections_Pauses(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    start_time_pause = db.Column(DateTime(timezone=True))
    end_time_pause = db.Column(DateTime(timezone=True))
    pause_reason = db.Column(JSON)


    item_section_id = db.Column(db.Integer, db.ForeignKey('items_sections.id'))
    association_section = db.relationship('Items_Sections',back_populates='pauses')
