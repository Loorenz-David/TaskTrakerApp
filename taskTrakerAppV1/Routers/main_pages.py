from . import main
from flask import render_template, request, jsonify, redirect, flash, url_for
from flask_login import login_user,logout_user, login_required, current_user
from taskTrakerAppV1.models import Users
from taskTrakerAppV1.Functions.query_items import query_items
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


@main.route('/main/jsserving/adding_item', methods=['POST'])
@login_required
def adding_item():
    response = {'message':'something went wrong','status':200}
    
    data = request.json

    if data:
        items = add_items_db(data)
        if items == 'ok':
            response = {'message':'Item added','status':200}



    return jsonify(response)


@main.route('/main/jsserving/login', methods=['POST'])
def login():

    data = request.json
    response = {'status':'' , 'message':''}
    print(data)
    
    if data:
        user = Users.query.filter_by(username=data['username']).first()
        if user and user.password == data['password']:
            login_user(user)
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
    response = {'status':200,'message':'No Items'}

    data = request.json
    
    if data.get('type') == 'task':
        change_state = change_task_estate(data)
        response['message'] = change_state
    elif data.get('type') == 'set_time':
        record_action_time(data)

    

    return response 