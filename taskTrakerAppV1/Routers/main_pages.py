from . import main
from flask import render_template, request, jsonify, redirect, flash, url_for
from flask_login import login_user,logout_user, login_required, current_user
from taskTrakerAppV1.models import Users
from taskTrakerAppV1.Functions.query_items import query_items, query_stats
from taskTrakerAppV1.Functions.user_actions import change_task_estate, record_action_time, add_items_db


@main.route('/', methods=['POST','GET'])
@login_required
def home():
    print(current_user.role)

    return render_template('home_page.html',user_sections=current_user.sections,user_role=current_user.role)


@main.route('/login')
def login_router():
    return render_template('login_page.html')

@main.route('/add_item', methods=['POST','GET'])
@login_required
def add_item():
    
    return render_template('add_item.html')


@main.route('/admin_panel', methods=['POST','GET'])
@login_required
def admin_panel():
    
    return render_template('admin_panel.html')




@main.route('/main/jsserving/adding_item', methods=['POST'])
@login_required
def adding_item():
    response = {'message':'something went wrong, check console log','status':'alert'}
    
    data = request.json

    if data:
        try:
            items = add_items_db(data)
            if items == 'ok':
                response = {'message':'Item added','status':'confirmation'}
        except Exception as message:
            response = {'message':'Item not added, check console','status':'error'}


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
    response = {'status':200,'message':'No Items'}

    if data:
        items_found = query_items(data)

        response['data'] = items_found

        

    return jsonify(response)

@main.route('/main/jsserving/userAction', methods=['POST'])
def userAction():
    response = {'status':'alert','message':'something went wrong, try closing and opening the app.'}

    data = request.json
    try:
        
        if data.get('type') == 'task':
            change_state = change_task_estate(data)
            response['message'] = change_state
        elif data.get('type') == 'set_time':
            record_time = record_action_time(data)
            print(record_time,'-----------')
            if data['value'] == 'end_time':
                response['message'] = 'Item completed !'
                response['status'] = 'confirmation'
            elif data['value'] == 'start_time_pause':
                response['message'] = 'Item is paused !'
                response['status'] = 'confirmation'
            elif data['value'] == 'end_time_pause':
                response['message'] = 'Continue'
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