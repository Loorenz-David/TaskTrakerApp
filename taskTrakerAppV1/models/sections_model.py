from taskTrakerAppV1 import db

from sqlalchemy import Integer, String, DateTime, JSON, Boolean 
from sqlalchemy.ext.mutable import MutableList, MutableDict
from datetime import datetime, timezone
from flask_login import UserMixin


class Roles(db.Model):
    __tablename__ = 'roles'
    role_name = db.Column(String)
    permissions = db.Column(JSON)
    roles_metafields = db.Column(JSON)
    id=db.Column(db.Integer, primary_key=True)
    users = db.relationship('Users_Roles',back_populates='role',cascade='all, delete-orphan')

class Users_Roles(db.Model):
    __tablename__ = 'users_roles'
    id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    role = db.relationship('Roles', back_populates='users')
    user = db.relationship('Users', back_populates='roles')

class Users(UserMixin,db.Model):
    __tablename__ = 'users'
    id=db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    assign_sections = db.relationship("Users_Sections",back_populates='user' ,cascade='all, delete-orphan')
    email = db.Column(String)
    phone = db.Column(String)
    roles = db.relationship('Users_Roles', back_populates='user',cascade='all, delete-orphan')
    

class Users_Sections(db.Model):
    __tablename__ = 'users_sections'
    id = db.Column(db.Integer, primary_key= True)
    user_id = db.Column(db.Integer,db.ForeignKey('users.id'))
    section_id= db.Column(db.Integer,db.ForeignKey('sections.id'))
    main_section = db.Column(Boolean)
    user = db.relationship('Users', back_populates="assign_sections")
    section = db.relationship('Sections', back_populates="assign_users")
    


class Tasks (db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(String)
    task_description = db.Column(String)
     
    
    meta_fields_tasks = db.Column(MutableDict.as_mutable(JSON), default=dict)
    association_task = db.relationship("Tasks_Items", back_populates="task",cascade='all, delete-orphan')
    assign_section = db.relationship("Tasks_Sections", back_populates="task" ,cascade='all, delete-orphan')

    
class Tasks_Sections(db.Model):
    __tablename__ = 'tasks_sections'
    id = db.Column(db.Integer,primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey('sections.id'))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    order_indx = db.Column(Integer)

    task = db.relationship('Tasks', back_populates='assign_section')
    section = db.relationship('Sections', back_populates='assign_task')

class Sections(db.Model):
    __tablename__ = 'sections'
    id = db.Column(db.Integer, primary_key=True)
    section_name = db.Column(String, index=True)
    section_icon = db.Column(db.Text)

    meta_fields_sections = db.Column(MutableDict.as_mutable(JSON), default=dict)

    assign_users = db.relationship("Users_Sections",back_populates='section' ,cascade='all, delete-orphan')
    assign_task = db.relationship("Tasks_Sections",back_populates='section', cascade='all, delete-orphan')
    association_section = db.relationship("Items_Sections", back_populates="section", cascade='all, delete-orphan')
    pauses_reasons = db.relationship('Pauses_Reasons_Sections', back_populates='section',cascade='all, delete-orphan')
    association_tasks_items = db.relationship('Tasks_Items', back_populates='section', cascade='all, delete-orphan')

    section_order = db.Column(Integer)

# state: Incompleted
#state: Active
#state: Completed
class Tasks_Items (db.Model):
    __tablename__ = 'tasks_items'
    id = db.Column(db.Integer, primary_key=True)

    state = db.Column(String, default='Active')
    incompleted_notes = db.Column(String)
    meta_fields_task_items = db.Column(MutableDict.as_mutable(JSON), default=dict)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    section_id = db.Column(db.Integer,db.ForeignKey('sections.id'))

    section = db.relationship('Sections', back_populates='association_tasks_items')
    item = db.relationship("Items", back_populates="association_task")
    task =  db.relationship("Tasks", back_populates="association_task")


class Storage_Unit(db.Model):
    __tablename__ = 'storage_unit'
    id = db.Column(db.Integer, primary_key=True)
    storage_number = db.Column(String)
    storage_type = db.Column(String)
    abreviation = db.Column(String)
    capacity = db.Column(Integer)
    storage_metafields = db.Column(JSON)
    items = db.relationship('Items', back_populates='storage_unit')

# state Active: it is in storage, is not being restore
# state Working: someone has started to work with it
# state Completed: the item is restored
# state Restart: the item was completed and now is being restarted
# In-Storage: the item was added it can't be seen by working sections

class Items (db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    item_type = db.Column(String) #simple input
    item_class = db.Column(String) #simple input
    article_number = db.Column(String, index=True) #simple input
    upholstery = db.Column(String) #simple input
    quantity = db.Column(Integer) #simple input
    condition = db.Column(String) #simple input
    storage_number = db.Column(String, index=True) #simple input
    notes = db.Column(JSON) #simple input
    creation_time = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(DateTime(timezone=True))
    raw_total_duration = db.Column(Integer,default=0)
    real_total_duration = db.Column(Integer,default=0)
    raw_total_pause_duration = db.Column(Integer,default=0)
    
    
    due_date = db.Column(String) #simple input
    porpuse = db.Column(String) # is it a client order, or for shop
    item_came_back = db.Column(JSON) # if the item was fixed and came back because of issues {came_back_from: "client",reason:[the reson],issues:[list of issues]}
    item_problems = db.Column(JSON) #simple input {"list of issues": ['not stable',"seat unstable"]}
    state = db.Column(String, default='In-storage')
    images_url = db.Column(JSON)
    
    meta_fields_items = db.Column(MutableDict.as_mutable(JSON), default=dict) # a column to add new columns as keys

    storage_unit_id = db.Column(db.Integer, db.ForeignKey('storage_unit.id'))
    storage_unit = db.relationship("Storage_Unit",back_populates='items')
    association_section = db.relationship("Items_Sections", back_populates="item", cascade='all, delete-orphan')
    association_task = db.relationship("Tasks_Items", back_populates="item", cascade='all, delete-orphan')

# state Active = the item is active
# state Pause = the item is in pause and has a pause being recorder in the relatioship, 
# state Completed = the item is completed from the section, an end time is recorded, and a finsih item pause is started
# state Restart = the item is send back to a section, the finished item pause is recorded and a new pause is made
# state Working = the item is recording a completion time

class Items_Sections(db.Model):
    __tablename__ = 'items_sections'
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'))
    section_id = db.Column(db.Integer, db.ForeignKey('sections.id'))
    user_history_action = db.Column(MutableList.as_mutable(JSON), default=list)
    workflow_order= db.Column(Integer)
    start_time = db.Column(DateTime(timezone=True))
    end_time = db.Column(DateTime(timezone=True))
    raw_time_duration = db.Column(Integer,default=0)
    real_time_duration = db.Column(Integer,default=0)
    raw_pause_duration = db.Column(Integer,default=0)
    work_pause_duration = db.Column(Integer,default=0)
    state = db.Column(String, default="Active")
    meta_fields_items_sections = db.Column(MutableDict.as_mutable(JSON), default=dict)

    item = db.relationship("Items", back_populates="association_section")
    section = db.relationship("Sections", back_populates="association_section")
    pauses = db.relationship('Items_Sections_Pauses', back_populates= "association_section",cascade='all, delete-orphan')
    


    

class Items_Sections_Pauses(db.Model):
    __tablename__ = 'items_sections_pauses'
    id = db.Column(db.Integer, primary_key=True)

    start_time_pause = db.Column(DateTime(timezone=True))
    end_time_pause = db.Column(DateTime(timezone=True))
    pause_duration = db.Column(Integer,default=0)
    pause_reason = db.Column(JSON)

    # if true then it is related to work
    is_work_related = db.Column(Boolean)
    meta_fields_section_pauses = db.Column(MutableDict.as_mutable(JSON), default=dict)

    item_section_id = db.Column(db.Integer, db.ForeignKey('items_sections.id'))
    association_section = db.relationship('Items_Sections',back_populates='pauses')

class Pauses_Reasons_Sections(db.Model):
    __tablename__ = 'pauses_reasons_sections'
    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer,db.ForeignKey('sections.id'))
    pause_reason_id = db.Column(db.Integer,db.ForeignKey('pause_reasons.id'))

    pause_reason = db.relationship('Pause_Reasons',back_populates='assign_sections')
    section = db.relationship('Sections',back_populates='pauses_reasons')

class Pause_Reasons(db.Model):
    __tablename__ = 'pause_reasons'
    id = db.Column(db.Integer, primary_key=True)
    pause_descriptions = db.Column(String)
    assign_sections = db.relationship('Pauses_Reasons_Sections',back_populates='pause_reason',cascade='all, delete-orphan')
    is_work_related = db.Column(Boolean)


class Items_Types_Classes(db.Model):
    __tablename__ = 'items_types_classes'
    id = db.Column(db.Integer, primary_key=True)
    item_class = db.Column(String)
    item_type = db.relationship('Items_Types',back_populates='item_class', cascade='all, delete-orphan')

class Items_Types(db.Model):
    __tablename__ = 'items_types'
    
    id = db.Column(db.Integer, primary_key=True)
    item_type = db.Column(String)
    class_id = db.Column(db.Integer,db.ForeignKey('items_types_classes.id'))
    item_class = db.relationship('Items_Types_Classes',back_populates='item_type')


# this modesl is used by the fron end to create values dinamically 
# if some value is deleted it will not affect the the other models as it is borrowing the information, is not related to other models.


class Items_Conditions(db.Model):
    __tablename__ = 'items_conditions'
    id = db.Column(db.Integer, primary_key=True)
    condition_description = db.Column(String)
    condition_name = db.Column(String)


