from . import main
from flask import render_template, request, jsonify, redirect, flash, url_for
from flask_login import login_user,logout_user, login_required, current_user
from taskTrakerAppV1.models import Users, Storage_Unit, Sections,Items_Types_Classes
from taskTrakerAppV1.Functions.query_items import query_items_db, query_stats, query_assignments
from taskTrakerAppV1.Functions.query_dbs import query_dbs, get_storages, get_sections
from taskTrakerAppV1.Functions.user_actions import change_task_estate, record_action_time, add_items_db, modify_item, delete_item_db
from taskTrakerAppV1.Functions.create_objs import create_in_db, edit_in_db, delete_in_db
from collections import defaultdict
import json
from werkzeug.utils import secure_filename
import os


import boto3
import uuid


@main.route('/', methods=['POST','GET'])
@login_required
def home():
    

    return render_template('home.html')


@main.route('/working_sections/router/working_sections',methods=['POST','GET'])
def working_sections():
    print('entering working section')
    user = current_user
    assign_sections = []

    
    
    for section in user.assign_sections:
        
        query_section = Sections.query.get(int(section.section_id))
        if query_section:
            section_dict = {'id':query_section.id,'section_name':query_section.section_name,'section_icon':query_section.section_icon}
            section_order = query_section.section_order
            if section.main_section:
                section_order = 0
            section_dict['section_order'] = section_order

            
            assign_sections.append(section_dict)
    assign_sections = sorted(assign_sections, key=lambda x:(x['section_order']))

    sections_list = get_sections()

    
    

    return render_template('working_sections.html',user=user,assign_sections=assign_sections,sections_list = sections_list)




@main.route('/creation_tools/router/creation_tools',methods=['POST','GET'])
def creation_tools():

    

    return render_template('creation_tools.html')


@main.route('/get_db_info/jsserving/databases_info',methods=['POST','GET'])
def databases_info():
    response = {'status':'alert','message':'no data was found.'}
    data = request.json

    try:
        if not data.get('model_name'):
            raise Exception('no model name specify')
        
        if isinstance(data['model_name'],list):
            adquired_data = {}
            for model in data['model_name']:
                adquired_data[model] = query_dbs({'model_name':model,'query':data['query'],'columns_to_unpack':data['columns_to_unpack']})
           
        else:
            adquired_data = query_dbs(data)
        if adquired_data:
            response['status'] = 'confirmation'
            response['message'] = 'Data adquired.'
            response['data'] =  adquired_data
        else:

            response['status'] = 'alert'
            response['message'] = 'No data was found.'
    except Exception as e:
        response['status'] = 'error'
        response['message'] = 'Something went wrong, check console'
        response['error_message'] = str(e)

    return jsonify(response)

@main.route('/create_obj/jsserving/create_obj',methods=['POST','GET'])
def create_obj():
    response = {'status':'error','message':''}
    data = request.json

    try:
        if data['actionType'] == 'create_obj':
            create_in_db(data)
            response['message'] = 'object created'

        elif data['actionType'] == 'edit_obj':
            edit_in_db(data)
            response['message'] = 'object edited'

        elif data['actionType'] == 'delete_obj':
            
            delete_in_db(data)
            response['message'] = 'object deleted'

       
        response['status']='confirmation'
        
        
    except Exception as e:
        print(e)
        response['message'] = str(e)

    return jsonify(response)


@main.route('/login')
def login_router():
    return render_template('login_page.html')

@main.route('/add_item', methods=['POST','GET'])
@login_required
def add_item():


 # gets the storages available in the models
    
    
    storage_dict, storage_types = get_storages()

    # gets the sections available in the models
    
    sections_list = get_sections(get_icon=True)
    
    item_types_dict = {}
    item_classes = []
    query_item_classes = Items_Types_Classes.query.all()
    for item_class  in query_item_classes:
        item_class_name = item_class.item_class
        item_types_dict[item_class_name] = []
        
        
        for item_type in item_class.item_type:
            item_types_dict[item_class_name].append(item_type.item_type)

        item_classes.append(item_class_name)

   
    
    return render_template('add_item.html', 
                           item_classes = item_classes,
                           item_types_dict = json.dumps(item_types_dict),
                           sections_list = sections_list,
                           storages_map = json.dumps(storage_dict),
                            storage_types = storage_types)


@main.route('/admin_panel', methods=['POST','GET'])
@login_required
def admin_panel():
    
    return render_template('admin_panel.html')


@main.route('/items_db/router/items_db', methods=['POST','GET'])
@login_required
def items_db():
    storage_dict, storage_types = get_storages()

    # gets the sections available in the models
    
    sections_list = get_sections(get_icon=True)

   
    

    return render_template('items_db.html',
                           storages_map = json.dumps(storage_dict),
                           storage_types = storage_types,
                           sections_list = sections_list
                            )



@main.route('/main/jsserving/adding_item', methods=['POST'])
@login_required
def adding_item():
    response = {'message':'something went wrong check, check console log','status':'alert'}
    
    data = request.json

    if data:
        try:
            items = add_items_db(data)
            if items == 'ok':
                response = {'message':'Item added','status':'confirmation'}
        except Exception as message:
            response = {'message':'Item not added, check console','status':'error'}


    return jsonify(response)

@main.route('/main/jsserving/edit_item', methods=['POST'])
@login_required
def edit_item():
    response = {'message':'something went wrong check, check console log','status':'alert'}
    
    data = request.json
    
    if(data):
        try:
            if data.get('delete'):
                temp_item_dict = {'item_id':data['delete']}
                delete_item_db(temp_item_dict)
                response['status'] = 'confirmation'
                response['message'] = 'item Deleted!'
            else:

                record_changes = modify_item(data)
                response = record_changes
        except Exception as e:
            response['status'] = 'error'
            response['message'] = 'something went wrong check console!'
            response['error_message'] = str(e)

    return jsonify(response)

@main.route('/main/jsserving/upload_picture',methods=['POST','GET'])
def upload_picture():
    response = {'message':'something went wrong check, check console log','status':'alert'}
    
    data = request.files
    if 'image' not in data:
        raise Exception('no file')
    
    file = data['image']

    filename = secure_filename(file.filename)
    

    s3 = boto3.client(
                        's3',
                        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                        region_name='eu-north-1',
                    )
    unique_id = str(uuid.uuid4())
    filename =  f"{unique_id}.webp"
    file_path = f"pictures_task_tracker_app/{filename}"

    
    upload = s3.upload_fileobj(
                                file,
                                'beyoappv5',
                                file_path,
                                ExtraArgs={'ContentType':'image/webp'}
    )
    file_url = f"https://beyoappv5.s3.eu-north-1.amazonaws.com/{file_path}"
    response = {'message':'Picture uploaded','status':'confirmation','picture_url': file_url}
    

    return jsonify(response)


@main.route('/main/jsserving/delete_picture',methods=['POST','GET'])
def delete_picture(data=None):
    
    response = {'message':'something went wrong check, check console log','status':'alert'}
    if not data:
        data = request.get_json()
    
    url_file = data.get('url_file')
    folder = data.get('folder')

    s3 = boto3.client(
                        's3',
                        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                        region_name='eu-north-1',
                    )
    

    bucket_name =  'beyoappv5'
    file_key = folder + url_file.split(folder,1)[-1]
    
    s3.delete_object(Bucket=bucket_name,Key=file_key)

    if data.get('edit_item'):
        
        modify_item({'deleted_picture':True,'item_id':int(data['edit_item'])})

    response = {'status':'confirmation', 'message':'picture removed!'}
    
    return jsonify(response)


@main.route('/main/jsserving/login', methods=['POST'])
def login():

    data = request.json
    response = {'status':'' , 'message':''}
    print(data)
    
    if data:
        user = Users.query.filter_by(username=data['username']).first()
        if user and user.password == data['password']:
            login_user(user,remember=True)
            next_page = data.get('next')  # Get the next page from the URL
            response = {'status': '200', 'message': 'Login succesful'}
        else:
            response = {'status': '201', 'message': 'Wrong username or password'}

    
    return jsonify(response)

@main.route('/main/jsserving/logout', methods=['GET'])
def logout():
    logout_user()
    response = {'status': '200', 'message': 'Logout successful'}

    return redirect('/login')


@main.route('/main/jsserving/get_items', methods=['GET','POST'])
def get_items():

    data = request.json
    response = {'status':'alert','message':'No Items'}

    if data:
        items_found = []
        if data.get('page') and data.get('page') == 'working_sections':
            items_found = query_assignments(data)
            response['data'] = items_found[0]
            response['data_count'] = items_found[1]
        else:
            items_found = query_items_db(data)
            response['data'] = items_found[0]
            response['data_count'] = items_found[1]
        response['status'] = 'confirmation'
        response['message'] = 'Data adquired!'

    

    return jsonify(response)

@main.route('/main/jsserving/userAction', methods=['POST'])
def userAction():
    response = {'status':'alert','message':'something went wrong, try closing and opening the app.'}

    data = request.json
    try:
        
        if data.get('type') == 'task':
            print(data)
            change_state = change_task_estate(data)
            response['message'] = change_state
        elif data.get('type') == 'set_time':
            record_time = record_action_time(data)
            response['section_name'] = record_time
            if data['value'] == 'end_time':
                response['message'] = 'Item completed !'
                response['status'] = 'confirmation'
            elif data['value'] == 'start_time_pause':
                response['message'] = 'Item is paused !'
                response['status'] = 'confirmation'
            elif data['value'] == 'end_time_pause':
                response['message'] = 'Continue'
                response['status'] = 'confirmation'
            else:
                response['message'] = 'started!'
                response['status'] = 'confirmation'
            
    except Exception as message:
        print(message)
        response['message'] = 'something went wrong, contact a surpervisor.'
        response['status'] = 'error'

    

    return response 


@main.route('/main/jsserving/get_stats', methods=['GET','POST'])
def get_stats():

    data = request.json
    response = {'status':'alert','message':'No query'}

    if data:
        # try:
        section_stats = query_stats(data)

        response['data'] = section_stats

        response['status'] = 'confirmation'
        response['message'] = 'Data aquired !'
        # except Exception as e:
            # response['status'] = 'error'
            # response['message'] = 'error, check console'
            # response['error_message'] = str(e)
            # print(e)

        

    return jsonify(response)

