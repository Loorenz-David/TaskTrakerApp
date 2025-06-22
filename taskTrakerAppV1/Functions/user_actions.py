from taskTrakerAppV1.models import Items_Sections, Tasks_Items,Sections, Items, Items_Sections_Pauses, Pause_Reasons
from taskTrakerAppV1 import db
from datetime import datetime, timezone
from sqlalchemy import and_

# EXAMPLE DICT:
# {'task_id':1,'value:'state'}
# ---- if task state is incompleted add this keys:
# {'incompleted_notes': 'the item is missing article number', 'item_id':1}
 
# STATES: 
# state Active : the task has no state
# state Completed : the task is completed
# state Incompleted : the task couldn't be completed a message of the reason is attached

def create_section_assignment(section_list,item,query_item=False):

    if query_item:
        item = Items.query.get(int(item))
    
    for selected_section in section_list:
        section_query = Sections.query.get(int(selected_section))
        if not section_query:
            continue

        assignment = Items_Sections(item=item, section=section_query )
        db.session.add(assignment)

        for task in section_query.assign_task:
            query_old_task = Tasks_Items.query.filter(and_(Tasks_Items.item_id == item.id, Tasks_Items.section_id == int(selected_section), Tasks_Items.task_id == task.id ) ).all()
            if query_old_task:
                for match in query_old_task:
                    db.session.delete(match)

            item_task = Tasks_Items(item=item, task=task.task, section_id = int(selected_section))
            db.session.add(item_task)
            

def change_task_estate(data):

    query_task = Tasks_Items.query.get(int(data['assign_task_id']))
    if query_task:
        query_task.state = data['value']
        if data['value'] == 'Incompleted' :
            query_task.incompleted_notes = data['incompleted_notes']
            # add function that communicates this issue to the person in charge or sends a message in telegram pointing at the issue

        db.session.commit()
    return 'ok'


def is_utc(time):
    if isinstance(time,datetime):
        if time.tzinfo is None:
            time = time.replace(tzinfo=timezone.utc)
    else:
        raise Exception('the time passed is not datetime object')
    return time

def calculate_total_time(start_time,end_time,to='seconds'):
    start_time = is_utc(start_time)
    end_time = is_utc(end_time)
    duration = end_time - start_time
    if to == 'seconds':
        duration = int(duration.total_seconds())
    return duration


# EXAMPLE DICT:
# {"value": 'start_time_pause',"pause_reason_id":1}
# ---- if pause_reason in dict add: (this is mainly for the restart_item function)
# {"pause_reason":"restarted item to section","is_work_related":True}
# {"value": 'end_time_pause'}
#-----


def record_pause(query_item_section,data,set_time):

    if 'start_time_pause' in data['value']:
        new_pause = Items_Sections_Pauses()
        new_pause.association_section = query_item_section
        new_pause.start_time_pause = set_time

        if data.get('pause_reason'):
            new_pause.pause_reason = data['pause_reason']
            new_pause.is_work_related = data['is_work_related']

        else:
            query_pause_reason = Pause_Reasons.query.get(data['pause_reason_id'])
            if not query_pause_reason:
                raise Exception('pause reason not found in data base')
            new_pause.pause_reason = query_pause_reason.pause_description
            new_pause.is_work_related = query_pause_reason.is_work_related

        db.session.add(new_pause)
        query_item_section.state= 'Paused'

    elif 'end_time_pause' in data['value']:
       
        query_pause = Items_Sections_Pauses.query.filter(
            Items_Sections_Pauses.item_section_id == query_item_section.id,
            Items_Sections_Pauses.end_time_pause == None
            ).first()
        if not query_pause:
            raise Exception('try to end pause, but was not found in data base')  
                                                         
        query_pause.end_time_pause = set_time
        start_time_pause = query_pause.start_time_pause
       
        pause_duration = calculate_total_time(start_time=start_time_pause,
                                              end_time=set_time,
                                              to='seconds')
        query_item_section.state = 'Working'                                     
        
        query_pause.pause_duration = pause_duration
        query_item_section.raw_pause_duration += pause_duration
        query_item_section.item.raw_total_pause_duration += pause_duration

        if query_pause.is_work_related :
            query_item_section.work_pause_duration += pause_duration
            

# DICT EXAMPLE:
# {'item_id':1,"section_list":["Dismantler","Cleaner"],"user":user_name}
# section_list is now a list of ids not names
def restart_item(data):


    set_time = datetime.now(timezone.utc)
    section_with_active_item = []

    
    
    
   
    item_id = int(data['item_id'])
    for section_id in data['section_list']:
        query_item_section = Items_Sections.query.join(Items_Sections.section).filter(and_(
                                                                                        Items_Sections.item_id == int(item_id),
                                                                                        Sections.id == section_id
                                                                                    )
                                                                                ).first()
        
        if not query_item_section:
            query_section = Sections.query.get(int(section_id))
            if not query_section:
                raise Exception(f'no relation and no section with id {section_id}')

            query_item = Items.query.get(int(item_id))
            if not query_item:
                raise Exception(f'no item with id: {item_id}')
            
            create_section_assignment([section_id],query_item)
            
        else:
            if query_item_section.state == 'Completed':
               
                record_pause(query_item_section=query_item_section,
                                data={'value':'end_time_pause'},
                                set_time=set_time)
                record_pause(query_item_section=query_item_section,
                                data={'value':'start_time_pause','pause_reason':f'{data["user"]}, restarted item to this section','is_work_related':True},
                                set_time=set_time)
                
                query_item_section.state = 'Restart'
                query_item_section.end_time = None
                # query_item_section.user_history_action.append({'user':data.get('user'),'action':f'restarted item to {query_item_section.section.section_name}','time':set_time})
            else:
            
                section_with_active_item.append(query_item_section.section.section_name)
        
    

    db.session.commit()

    return {'message':'ok','not_change_sections':section_with_active_item}
        
    


def item_sections_status(item_id,query_list,action_dict=None):
    if action_dict is None:
        action_dict = []
    returnDict = {}

    query_item_in_sections = db.session.query(Sections.section_name).join(Items_Sections).filter(
        Items_Sections.item_id == item_id
    )

    if 'sections_status_completed' in query_list:
        completed_items = query_item_in_sections.filter(Items_Sections.state == 'Completed').all()
        returnDict['sections_status_completed'] = [name for (name,) in completed_items]

    if 'sections_status_incompleted' in query_list:
        incompleted_items = query_item_in_sections.filter(Items_Sections.state != 'Completed').all()
        returnDict['sections_status_incompleted'] = [name for (name,) in incompleted_items]

    if 'item_selected_section' in query_list:
        item_assign_sections = query_item_in_sections.all()
        returnDict['item_selected_section'] = [name for (name,) in item_assign_sections]

    if 'make_comparison' in action_dict:
        key1, key2 = action_dict['make_comparison']
       
        if len(returnDict.get(key1,[])) == len(returnDict.get(key2,[])):
            return True
        else:
            return False
   
    return returnDict


# EXAMPLE DICT:
# {"id": 1, "user": user_name , "value":"start_time" / "end_time" / check pause example dict, }
def record_action_time(data):
    query_item_section = Items_Sections.query.get(int(data['id']))
    

    if query_item_section:
        set_time = datetime.now(timezone.utc)

        if 'pause' in data['value']:
            record_pause(query_item_section=query_item_section,
                        data=data,
                        set_time=set_time)
            
        
            
        else:
            setattr(query_item_section,data['value'],set_time)

            if data['value'] == 'start_time':
                if item_sections_status(query_item_section.item_id,['sections_status_incompleted','item_selected_section'],
                                            {'make_comparison':['sections_status_incompleted','item_selected_section']}):
                    if not query_item_section.item.start_time:
                        query_item_section.item.start_time = set_time
                        query_item_section.item.state = 'Working'
                query_item_section.state = 'Working'
            
            elif data['value'] == 'end_time':
                start_time = query_item_section.start_time
                if not start_time:
                    raise Exception("Item was not started.")
                
                raw_duration = calculate_total_time(start_time=start_time,
                                                    end_time=set_time)
            
                query_item_section.raw_time_duration = raw_duration
                
                query_item_section.real_time_duration = int(raw_duration - query_item_section.raw_pause_duration)


                record_pause(query_item_section=query_item_section,
                             data={'value':'start_time_pause','pause_reason':'Pause as item is completed','is_work_related':True},
                             set_time=set_time)
                
                query_item_section.state = 'Completed'

                if item_sections_status(query_item_section.item_id,
                                        ['sections_status_completed','item_selected_section'],
                                        {'make_comparison':['sections_status_completed','item_selected_section']}):
                    
                    modify_item({'state':'Completed','item_id':query_item_section.item_id})
        
        # query_item_section.user_history_action.append({'user':data['user'],'action':data['value'],'time':set_time})
                   
               

        db.session.commit()
        return query_item_section.section.section_name


section_list = ['Dismantler','Cleaner','Upholstery Remover', 'Foam Installer','Upholstery Installer','Wood Frame Fixer','Remontering','Photography' ]

#EXAMPLE DICT:
#{"item":{check Items Model to see the columns}}


def add_items_db(data):

    # I must think about the logic on making items from long time fixed to be restarted
    # if data['item_came_back'] == True:
    #     data['state'] = 'Restart'

    new_item = Items(**data['item'])
    db.session.add(new_item)
    
    create_section_assignment(data['selected_sections'],new_item)
   

    db.session.commit()

    return 'ok'


def delete_item_db(data):
    query_item = Items.query.get(int(data['item_id']))
    print(query_item, 'deleteing-----')
    if not query_item:
        raise Exception('Item not found')
    db.session.delete(query_item)
    db.session.commit()

    return 'ok'

# item state : None / Null = the item is active
# item state : Paused = the item is recording a pause
# item state : Restart = the item is send back to the specify sections ends pause and begins a new one
# item state : Completed  = the item is completed, the end time is added to the item

# DICT EXAMPLE 
# { "item_id":1, "state": check states, "simple_inputs":check Model Items to see simple inputs}
#--- if restart add:
#{"section_list":["Dismantler","Cleaner"], "user":user_name}
def modify_item(data):
    response = {}
    query_item = Items.query.get(int(data['item_id']))

   
    set_time = datetime.now(timezone.utc)
    
    if data.get('simple_inputs'):
        simple_inputs = data['simple_inputs']
       
        for key, value in simple_inputs.items():
            setattr(query_item,key,value)
        

    if data.get('deleted_picture') and data.get('deleted_picture') == True:
        query_item.images_url = None
    
   
    if 'state' in data:
        query_item.state = data['state']

        if data['state'] == 'Completed':
            query_item.end_time = set_time

            item_creation_time = query_item.creation_time
            raw_duration = calculate_total_time(start_time=item_creation_time,
                                                end_time=set_time)
            
            query_item.raw_total_duration = raw_duration
           
            item_start_time = query_item.start_time
            
            if item_start_time:
                real_duration = calculate_total_time(start_time=item_start_time,
                                                 end_time=set_time)
                query_item.real_total_duration = int( real_duration - query_item.raw_total_pause_duration)
               
        # if more info should be added to the item the model has a metafield column 

        
        
        if data['state'] == 'Restart' and data.get('section_list'):
            restarted = restart_item({'item_id':data['item_id'],'section_list':data.get('section_list'),'user':data.get('user')})
            if len(restarted['not_change_sections']) > 0:
                response['not_change_sections'] = restarted['not_change_sections']
            if data.get('restarting_from') and data.get('restarting_from') == 'working sections':
                query_item.state = 'Active'
   
    if any('modify_assign_section' in key for key in data):
        for key in data:
            if 'modify_assign_section' in key:
                if data[key].get('related_id'):
                    query_assignment = Items_Sections.query.filter(and_(Items_Sections.section_id == int(data[key]['section_id']),
                                                                Items_Sections.id == int(data[key]['related_id']))).first()
                    if not query_assignment:
                        raise Exception('no relation of item and section found')

                    if data[key]['value'] == False:
                        db.session.delete(query_assignment)
                if data[key]['value'] == True:
                    print('creating new assignment !!!!')
                    new_assignment = create_section_assignment([data[key]['section_id']],
                                                                item=query_item)
                    
                    print('assginment was created')
                    # query_section = Sections.query.get(int(data[key]['section_id']))
                    # if not query_section:
                    #     raise Exception(f'no section found with that name section id: {data[key]["section_id"]}')

                    # new_assignment = Items_Sections(item=query_item,section=query_section)
                    # db.session.add(new_assignment)



    
    db.session.commit()
    response['status'] = "confirmation"
    response['message'] = "changes saved!"

    return response