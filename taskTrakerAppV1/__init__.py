from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///track_app_db.db'
    app.config['SECRET_KEY'] = "secrete app key" 
    

    db.init_app(app)

    login_manager.login_view = 'main.login_router'
    login_manager.init_app(app)



    from . import models

    from .models import Sections, Items, Items_Sections, Tasks, Tasks_Items,Users
    with app.app_context():
        db.create_all()

        section_list = ['Dismantler','Cleaner','Upholstery remover']
        task_list = [{'section':'Dismantler', 'tasks': [
                                                        {'task_name':'Quantity check','task_description':'the quantity of items matches the specify quantity'},
                                                        {'task_name':'Article number check','task_description':'The chairs has the correct article number'},
                                                        {'task_name':'Chairs are Dismantle','task_description':'The chairs have been dismantle'}
                                                        ]},
                     {'section':'Cleaner', 'tasks': [
                                                        {'task_name':'items are placed','task_description':'The items have been placed on assign postion '},
                                                        {'task_name':'Article number check','task_description':'The chairs has the correct article number'},
                                                        {'task_name':'The chairs are washed','task_description':'The chairs are washed'}
                                                        ]},
                                                        ]
        
        order_section_indx = 1
        for section in section_list:
            query_section = Sections.query.filter_by(section_name=section).first()
            if not query_section:
                new_section = Sections(section_name=section,section_order_indx=order_section_indx)
                db.session.add(new_section)
                order_section_indx += 1

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
            item = Items(article_number = '88', upholstery='vg6',quantity='4',condition='not stabe / frame issues',trolley='tr-1')
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


        create_user_test = False
        if create_user_test:
            account = Users(username='Roma',password='Roma', sections=['Upholstery instalation','Dismantler','Cleaner'],role='Worker')
            db.session.add(account)
            db.session.commit()

        # change = Users.query.get(2)
        # change.sections = ['Upholstery remover','Dismantler','Cleaner']
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