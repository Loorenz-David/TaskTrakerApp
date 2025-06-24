from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from .task_dict import task_list
from datetime import timedelta
from dotenv import load_dotenv
from flask_migrate import Migrate

migrate = Migrate()
db = SQLAlchemy()
login_manager = LoginManager()
load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///track_app_db.db' #default path should be track_app_db.db
    app.config['SECRET_KEY'] = "secrete app key" 
    app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=30)

    db.init_app(app)
    migrate.init_app(app,db)
    login_manager.login_view = 'main.login_router'
    login_manager.init_app(app)



    from . import models

    from .models import Sections, Items, Items_Sections, Tasks, Tasks_Items,Users,Users_Sections,Roles, Users_Roles, Items_Types_Classes,Items_Types
    with app.app_context():
        # db.create_all()
      

        # section_list = ['Dismantler','Cleaner','Upholstery Remover', 'Foam Installer','sewing','Upholstery Installer','Wood Frame Fixer','Remontering', 'Photography']
        # section_list_v =  [{'section_name':'Dismantler','section_icon':'''<svg id-value="Dismantler"  class="svg-2 svg-color-dark-grey"  viewBox="-0.5 0 65 65" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>Screw-driver</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Screw-driver" sketch:type="MSLayerGroup" transform="translate(2.000000, 2.000000)" stroke="currentColor" stroke-width="2"> <path d="M38.6,32 L60.4,10.2 C61.2,9.4 61.2,8.2 60.4,7.4 L53.4,0.4 C52.6,-0.4 51.4,-0.4 50.6,0.4 L28.8,22.2 C28.2,22.8 28.1,23.7 28.4,24.5 C28,24.6 27.7,24.8 27.4,25 L25.3,25.7 C24.5,26.5 24.5,27.7 25.3,28.5 L32.3,35.5 C33.1,36.3 34.3,36.3 35.1,35.5 L35.8,33.4 C36.1,33.1 36.3,32.8 36.3,32.4 C37.1,32.7 38,32.6 38.6,32 L38.6,32 Z" id="Shape" sketch:type="MSShapeGroup"> </path> <path d="M51.3,5.2 L33.7,22.8" id="Shape" sketch:type="MSShapeGroup"> </path> <path d="M55.5,9.5 L37.9,27" id="Shape" sketch:type="MSShapeGroup"> </path> <path d="M2.8,60.8 L-0.1,58 L5.6,49.6 L9.1,47.4 L26.7,29.9 L30.9,34.1 L13.3,51.7 L11.2,55.2 L2.8,60.8 Z" id="Shape" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>'''},
        #                    {'section_name':'Cleaner','section_icon':'''<svg id-value="Cleaner" class="svg-2 svg-color-dark-grey"  version="1.1"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><style>.st0{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}</style><g><line class="st0" x1="16" y1="19" x2="16" y2="12"/><line class="st0" x1="19" y1="19" x2="19" y2="12"/><line class="st0" x1="22" y1="19" x2="22" y2="13"/><path class="st0" d="M23,29c1.3-3.3,2-6.8,2-10.4v-5.1c0-0.8-0.7-1.5-1.5-1.5S22,12.7,22,13.5v-1c0-0.8-0.7-1.5-1.5-1.5S19,11.7,19,12.5v-1c0-0.8-0.7-1.5-1.5-1.5S16,10.7,16,11.5v1c0-0.8-0.7-1.5-1.5-1.5S13,11.7,13,12.5V20v2.4l-2.5-2.5c-0.6-0.6-1.5-0.7-2.1-0.2c-0.8,0.6-0.9,1.8-0.2,2.5L15,29"/><path class="st0" d="M23.7,27c4,0.2,7.3-3,7.3-7c0-1.2-0.3-2.3-0.8-3.3c-0.8-1.5-0.9-3.2-0.4-4.7c0.3-1,0.4-2,0.2-3.1c-0.5-2.9-2.8-5.2-5.7-5.7c-1.6-0.3-3.2,0-4.5,0.7C18,4.7,16,4.9,14.1,4.3c-1-0.3-2.2-0.4-3.4-0.2C7.9,4.6,5.6,6.9,5.1,9.7c-0.5,3.1-1.6,6-3.2,8.8c-0.8,1.4-1.1,3-0.8,4.7c0.5,2.8,2.7,5.1,5.5,5.6c2.5,0.5,4.8-0.3,6.4-1.9"/></g></svg>'''},
        #                    {'section_name':'Upholstery Remover','section_icon':'''<svg id-value="Upholstery Remover" class="svg-2 svg-color-dark-grey"  version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 496 496" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path fill="currentColor" d="M341.376,69.552C332.736,29.248,296.544,0,255.328,0H176v40h-32v48h32v40h32v151.6c0,27.4,3.016,54.84,8.952,81.568 L241.584,472H256v24h16v-24h16v24h16v-24h14.416l24.632-110.832C348.984,334.448,352,307,352,279.6V120L341.376,69.552z M176,72 h-16V56h16V72z M336,279.6c0,26.232-2.88,52.512-8.576,78.104L305.584,456h-51.168l-21.832-98.296 C226.88,332.112,224,305.832,224,279.6V176h112V279.6z M336,160H224v-32h56v-16h-56h-8h-24V16h63.328 c33.728,0,63.336,23.936,70.408,56.904L336,120.84V160z"></path> <rect x="304" y="208" width="16" height="128"></rect> <rect x="256" y="208" width="16" height="96"></rect> <rect x="256" y="320" width="16" height="16"></rect> <rect x="208" y="56" width="16" height="16"></rect> <rect x="240" y="56" width="16" height="16"></rect> <rect x="272" y="56" width="16" height="16"></rect> </g> </g> </g> </g></svg>    '''}]
        


        
        
        # for section in section_list_v:
        #     query_section = Sections.query.filter_by(section_name=section['section_name']).first()
            
        #     if not query_section:
               
        #         new_section = Sections(**section)
                
                
        #         db.session.add(new_section)
        #         db.session.commit()

        # create_task = False
        # if create_task:
        #     for section_tasks in task_list:
        #         query_section = Sections.query.filter_by(section_name= section_tasks['section']).first()
        #         if query_section:
        #             for task in section_tasks['tasks']:
        #                 new_task = Tasks(task_name=task['task_name'],
        #                                     task_description=task['task_description'],
        #                                     task_order = task['task_order'],
        #                                     assign_section= query_section.id)
        #                 db.session.add(new_task)
                
            
        #     db.session.commit()
            

        # create_test_item =  False
        # if create_test_item: 
        #     item = Items(article_number = '11', upholstery='vg6',quantity='4',condition='not stabe / frame issues',trolley='tr-1')
        #     db.session.add(item)
        #     query = Sections.query.all()
            

        #     for section in query:

        #         entry = Items_Sections(item=item, section=section)  
        #         if section.section_name == 'Dismantler':
        #             entry.is_visible = True
                    
        #         print(entry.is_visible)
        #         db.session.add(entry)

        #         for task in section.tasks:
        #             tasks_items = Tasks_Items( item=item, task=task )
        #             db.session.add(tasks_items)

        #     db.session.commit()

        # # new_task = Tasks(task_name='Check article number',task_description='make sure all items have an article number')
        # # db.session.add(new_task)
        # # db.session.commit()

        # create_user_test = False
        # if create_user_test:
        #     account = Users(username='David',password='DavidPassword!')
        #     role = Roles(role_name = 'Admin')

        #     link = Users_Roles(role = role, user= account)
        #     db.session.add(account)
        #     db.session.add(role)
        #     db.session.add(link)


        #     db.session.commit()

        # querySection = Sections.query.get(8)
        # querySection.section_icon = '''<svg id-value="Heavy Furniture" class="svg-2 svg-color-dark-grey"  fill="currentColor" viewBox="0 0 512 512" enable-background="new 0 0 512 512" id="Layer_1" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M222.019,246.826h-0.333c-5.523,0-10-4.477-10-10s4.477-10,10-10h0.333c5.523,0,10,4.477,10,10 S227.542,246.826,222.019,246.826z"></path> </g> <g> <path d="M288.352,246.826h-0.333c-5.523,0-10-4.477-10-10s4.477-10,10-10h0.333c5.523,0,10,4.477,10,10 S293.875,246.826,288.352,246.826z"></path> </g> <g> <path d="M111.879,372.51H69.523c-5.523,0-10-4.477-10-10V196.035c0-5.523,4.477-10,10-10h42.355c5.523,0,10,4.477,10,10V362.51 C121.879,368.033,117.402,372.51,111.879,372.51z M79.523,352.51h22.355V206.035H79.523V352.51z"></path> </g> <g> <path d="M442.477,372.51h-42.358c-5.523,0-10-4.477-10-10V196.035c0-5.523,4.477-10,10-10h42.358c5.523,0,10,4.477,10,10V362.51 C452.477,368.033,448,372.51,442.477,372.51z M410.118,352.51h22.358V206.035h-22.358V352.51z"></path> </g> <g> <path d="M442.477,206.035H69.523c-5.523,0-10-4.477-10-10V149.49c0-5.523,4.477-10,10-10h372.953c5.523,0,10,4.477,10,10v46.545 C452.477,201.558,448,206.035,442.477,206.035z M79.523,186.035h352.953V159.49H79.523V186.035z"></path> </g> <g> <path d="M400.118,279.023H111.879c-5.523,0-10-4.477-10-10v-71.098c0-5.523,4.477-10,10-10h288.239c5.523,0,10,4.477,10,10v71.098 C410.118,274.546,405.641,279.023,400.118,279.023z M121.879,259.023h268.239v-51.098H121.879V259.023z"></path> </g> <g> <path d="M400.118,279.023h-144.12c-5.523,0-10-4.477-10-10v-71.098c0-5.523,4.477-10,10-10h144.12c5.523,0,10,4.477,10,10v71.098 C410.118,274.546,405.641,279.023,400.118,279.023z M265.998,259.023h124.12v-51.098h-124.12V259.023z"></path> </g> </g> </g></svg>'''
        # db.session.commit()

        # role = Roles(role_name = 'Worker')

        # user = Users.query.get(1)
        # link = Users_Roles(role=role,user=user)

        
        # db.session.add(role)
        # db.session.add(link)
        # db.session.commit()

        # sections = Sections.query.all()
        # user = Users.query.get(1)
        
        # for section in sections:
            
        #     asso = Users_Sections(user=user,section=section)
        #     db.session.add(asso)
        # db.session.commit()


        item_lists = [{'item_class':'for resting','item_types':['Dining chair','Arm chairs','Sofa','Stol']},
                      {'item_class':'for storaging','item_types':['shelf','highbord','sidebord','byro']},
                      {'item_class':'for placing','item_types':['Dining Table','Coffe table','Bed side table']}]
        # for item in item_lists:
        #     new_class = Items_Types_Classes(item_class = item['item_class'])
            
            
        #     for type in item['item_types']:
        #         new_type = Items_Types(item_type=type)
        #         new_class.item_type.append(new_type)

        #     db.session.add(new_class)
        # db.session.commit()
        

    
    

    @login_manager.user_loader
    def load_user(user_id):
        return Users.query.get(int(user_id))
    
    @app.context_processor
    def inject_role_checker():
        def has_role(role_name):
            return any(r.role.role_name == role_name for r in current_user.roles)
        return dict(has_role=has_role)



    from .Routers import main
    app.register_blueprint(main)

    

    return app



# from taskTrakerAppV1.Functions.query_items import query_items
# with app.app_context():
#     test = query_items({'section':'Dismantler'})

#     print(test)