from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .task_dict import task_list
from datetime import timedelta

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///track_app_db.db' #default path should be track_app_db.db
    app.config['SECRET_KEY'] = "secrete app key" 
    app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=30)

    db.init_app(app)

    login_manager.login_view = 'main.login_router'
    login_manager.init_app(app)



    from . import models

    from .models import Sections, Items, Items_Sections, Tasks, Tasks_Items,Users
    with app.app_context():
        db.create_all()
      

        section_list = ['Dismantler','Cleaner','Upholstery Remover', 'Foam Installer','Upholstery Installer','Wood Frame Fixer','Remontering', 'Photography']
        
        
        special_section = 'Wood Frame Fixer'
        special_order = 3
        order_section_indx = 1
        for section in section_list:
            query_section = Sections.query.filter_by(section_name=section).first()
            
            if not query_section:
                if section == special_section:
                    new_section = Sections(section_name=section,section_order_indx=special_order)
                else:
                    new_section = Sections(section_name=section,section_order_indx=order_section_indx)
                    order_section_indx += 1
                
                db.session.add(new_section)
                db.session.commit()

        create_task = False
        if create_task:
            for section_tasks in task_list:
                query_section = Sections.query.filter_by(section_name= section_tasks['section']).first()
                if query_section:
                    for task in section_tasks['tasks']:
                        new_task = Tasks(task_name=task['task_name'],
                                            task_description=task['task_description'],
                                            assign_section= query_section.id)
                        db.session.add(new_task)
                
            
            db.session.commit()
            

        create_test_item =  False
        if create_test_item: 
            item = Items(article_number = '11', upholstery='vg6',quantity='4',condition='not stabe / frame issues',trolley='tr-1')
            db.session.add(item)
            query = Sections.query.all()
            

            for section in query:

                entry = Items_Sections(item=item, section=section)  
                if section.section_name == 'Dismantler':
                    entry.is_visible = True
                    
                print(entry.is_visible)
                db.session.add(entry)

                for task in section.tasks:
                    tasks_items = Tasks_Items( item=item, task=task )
                    db.session.add(tasks_items)

            db.session.commit()



        create_user_test =False
        if create_user_test:
            account = Users(username='Vitaly',password='Vitaly', sections=["Photography","Remontering"],role='Worker')
            db.session.add(account)
            db.session.commit()

        # change = Users.query.get(4)
        # change.password = 'Nazar'
        # db.session.commit()
    
        

    
    

    @login_manager.user_loader
    def load_user(user_id):
        return Users.query.get(int(user_id))



    from .Routers import main
    app.register_blueprint(main)

    

    return app

app = create_app()

# from taskTrakerAppV1.Functions.query_items import query_items
# with app.app_context():
#     test = query_items({'section':'Dismantler'})

#     print(test)