from taskTrakerAppV1.models import Items_Sections, Sections, Items, Tasks_Items,Tasks, Tasks_Sections
from taskTrakerAppV1 import db
from datetime import datetime, timedelta, timezone
from sqlalchemy import and_, func, and_, case


def query_items(data):
    query_items = Items_Sections.query
    query_items= query_items.join(Items_Sections.section).filter(Sections.section_name== data['section'])

    if data.get('is_completed'):
        query_items = query_items.filter(Items_Sections.is_completed == data['is_completed'])
    if data.get('is_visible'):
        query_items = query_items.filter(Items_Sections.is_visible == data['is_visible'])

    query_items = query_items.all()

    results = []

    for row in query_items:

        section_name = row.section.section_name 

        tasks = []
        for task in row.item.association_task:
             if task.task.section.section_name == section_name:
                tasks.append({
                    'task_id':task.id,
                    'is_completed': task.is_completed,
                    'task':{
                            'task_name':task.task.task_name,
                            'task_description':task.task.task_description,
                    }
                }) 

        pauses_ls = []
        for pause in row.pauses:
            pause_dict = {
                'start_time_pause': pause.start_time_pause,
                'end_time_pause':pause.end_time_pause,
                'pause_reason':pause.pause_reason}
            
            if pause.end_time_pause:
                pause_duration = pause.end_time_pause.replace(tzinfo=timezone.utc) -pause.start_time_pause.replace(tzinfo=timezone.utc)
                pause_dict['pause_duration'] = int(pause_duration.total_seconds())
            
            pauses_ls.append(pause_dict)
        
        
        itemDict = {
            'id':row.id,
            'is_completed':row.is_completed,
            'is_visible':row.is_visible,
            'is_paused':row.is_paused,
            'start_time':row.start_time,
            'end_time': row.end_time,
            'end_time': row.end_time,
            'section_name': row.section.section_name,
            'trolley':row.item.trolley,
            'item': {   
                       'article_number': row.item.article_number,
                       'upholstery':row.item.upholstery,
                       'quantity':row.item.quantity,
                       'condition':row.item.condition,
                       'item_type':row.item.item_type,
                       'notes':row.item.notes
                       },
            'pauses': pauses_ls,
            'tasks':tasks
        }
        results.append(itemDict)
        

    return results


def query_stats(data):

    results = {}

    dateFrom_to_query = datetime.strptime(data['date_from'],"%Y-%m-%d")
    if not data.get('date_to'):
        dateTo_to_query = dateFrom_to_query + timedelta(days=1)
    else:
        dateTo_to_query = datetime.strptime(data['date_to'],'%Y-%m-%d')


   
    query = Items_Sections.query

    results['general_stats'] = {'total_active_items':0,'completed_items':0,'average_raw_item_seconds':0,'average_real_item_seconds':0}
    general_stats_raw_total_time = 0
    general_stats_work_pause_time = 0
    general_stats_raw_pause_time = 0
    general_stats_pause_events = 0

    for section in data['sections']:

        
        activeItems_ls = []
        completed_items = []

        query_section = query.join(Items_Sections.section).join(Items_Sections.item).filter(
            Sections.section_name== section,
            Items.is_completed == False,
            )
        
        activeItems_ls = query_section.all()

        completed_items_query = query_section.filter(Items_Sections.end_time >= dateFrom_to_query,
                                                    Items_Sections.end_time < dateTo_to_query,
                                                    Items_Sections.is_completed == True)
        
        completed_items = completed_items_query.all()

        
        results[section] = {'total_active_items':0,'completed_items':0,'raw_time':0,'real_time':0,'pause_time_work':0}

        for item in activeItems_ls:
            results['general_stats']['total_active_items'] += int(item.item.quantity)
            if not item.is_completed:
                results[section]['total_active_items'] += int(item.item.quantity)

        raw_total_time = 0
        raw_pause_time = 0
        time_pauses_work = 0
        pauses_as_events = 0
        # results[section] = {'completed_items':0}
        for item in completed_items:
            item_qnt = int(item.item.quantity)
            results[section]['completed_items'] += item_qnt
            results['general_stats']['completed_items'] += item_qnt
            raw_total_time += int(item.total_duration)
            general_stats_raw_total_time += raw_total_time

            for pause in item.pauses:
                
                duration =  pause.end_time_pause.replace(tzinfo=timezone.utc) - pause.start_time_pause.replace(tzinfo=timezone.utc)
                duration_seconds = int(duration.total_seconds())
                raw_pause_time += duration_seconds
                general_stats_raw_pause_time += duration_seconds
                if pause.pause_reason != 'finish work shift':
                    time_pauses_work += duration_seconds
                    pauses_as_events += 1

                    general_stats_work_pause_time += duration_seconds
                    general_stats_pause_events += 1




       
        if raw_total_time > 0 :
            results[section]['raw_time'] = raw_total_time // results[section]['completed_items']
            results[section]['real_time'] = (raw_total_time - raw_pause_time) // results[section]['completed_items']
            if time_pauses_work > 0 : 
                results[section]['pause_time_work'] = time_pauses_work // pauses_as_events

        
            
        
        
    if general_stats_raw_total_time > 0:
        results['general_stats']['average_raw_item_seconds'] =  results['general_stats']['completed_items'] / general_stats_raw_total_time 
        results['general_stats']['average_pause_time'] = general_stats_work_pause_time / general_stats_pause_events
        results['general_stats']['average_real_item_seconds'] = results['general_stats']['completed_items'] / ( general_stats_raw_total_time - general_stats_raw_pause_time)




    return results


def unpack_item(item,unpack_type):

    unpacked_item = {}

    if unpack_type == 'essentials':
        unpacked_item = {'id':item.id,
                         'article_number':item.article_number,
                         'due_date':item.due_date,
                         'images_url':item.images_url,
                         'state':item.state,
                         'porpuse':item.porpuse,
                         'storage_number':item.storage_number,
                         'quantity':item.quantity,
                         }
        work_in_progress_list = []

        for working_section in item.association_section:
            working_section_dict = {'id': working_section.id,
                                    'state':working_section.state,
                                    'section_name':working_section.section.section_name,
                                    'section_id':working_section.section.id}
            work_in_progress_list.append(working_section_dict)
                     
        unpacked_item['assign_sections'] = work_in_progress_list

    
    elif unpack_type == 'for_editing':
        unpacked_item = {'upholstery':item.upholstery,
                         'condition':item.condition,
                         'notes':item.notes,
                         'creation_time':item.creation_time,
                         'start_time':item.start_time,
                         'end_time':item.end_time,
                         'due_date':item.due_date,
                         'porpouse':item.porpuse,
                         'images_url':item.item_came_back,
                         'item_problems':item.item_problems,
                        }
        
    
                     



    return unpacked_item



def sort_by_storage(list_of_items):

    sorted_dict = {}
    for item in list_of_items:
        item_storage = item['storage_number']
        if not item_storage:
            item_storage = 'No storage'

        if item_storage not in sorted_dict: 
            sorted_dict[item_storage] = []
        
        sorted_dict[item_storage].append(item)

    for item_storage in sorted_dict:
        sorted_dict[item_storage].sort(key=lambda x: datetime.strptime(x['due_date'],'%Y-%m-%d') if x.get('due_date') else datetime.max)
    
    return sorted_dict

def query_items_db(data):

 
    query = Items.query

    if data['query_type'] == 'all':
        query = query.all()

    elif data['query_type'] == 'single_item':
        query = query.filter(Items.id == data['item_id'])
       
    
        

    list_of_items = []
    for item in query:
        unpacked = unpack_item(item,unpack_type=data['unpack_type'])
        list_of_items.append(unpacked)

    sorted_dict = {}
    if data.get('sort'):
        if data['sort'] == 'by_storage':
           
            list_of_items = sort_by_storage(list_of_items)
   
    return list_of_items



def unpack_assignment(unpack_type,obj):
    unpacked_dict = {}
    if unpack_type == 'essentials':
        unpacked_dict = {
            'id': obj.id,
            'state':obj.state,
            'article_number':obj.item.article_number,
            'quantity':obj.item.quantity,
            'due_date':obj.item.due_date,
            'item_came_back':obj.item.item_came_back,
            'storage_number':obj.item.storage_number,
            'images_url':obj.item.images_url,
            'porpuse':obj.item.porpuse,
            'start_time':obj.start_time,
            'end_time':obj.end_time,
            'item_id':obj.item_id,
        }

        work_in_progress_list = []

        for working_section in obj.item.association_section:
            working_section_dict = {'id': working_section.id,
                                    'state':working_section.state,
                                    'section_name':working_section.section.section_name,
                                    'section_id':working_section.section.id}
            work_in_progress_list.append(working_section_dict)
                        
        unpacked_dict['assign_sections'] = work_in_progress_list
    if unpack_type == 'for_display':
        unpacked_dict = {
            'item_problems':obj.item.item_problems,
            'condition':obj.item.condition,
            'notes':obj.item.notes,
            'item_type':obj.item.item_type,
            
        }

        
        task_items_for_section = [ ti.id for ti in obj.item.association_task if ti.section_id == obj.section_id]
        query_assign_tasks = Tasks_Items.query.filter(Tasks_Items.id.in_(task_items_for_section)).all()
        
        task_dict_list = []
        for assign_task in query_assign_tasks:
            query_order = Tasks_Sections.query.filter(Tasks_Sections.task_id == assign_task.task.id, 
                                                    Tasks_Sections.section_id == assign_task.section_id).first()
                    

            task_dict = {
                            'state':assign_task.state ,
                            'incompleted_notes':assign_task.incompleted_notes ,
                            'task_assign_id':assign_task.id ,
                            'task_id':assign_task.task.id ,
                            'task_name':assign_task.task.task_name ,
                            'task_description':assign_task.task.task_description ,
                            
            }
            if query_order:
                task_dict['task_order'] = query_order.order_indx
           
            
            
            task_dict_list.append(task_dict)
        unpacked_dict['assign_task'] = task_dict_list

        if obj.item.item_class == 'for resting':
            unpacked_dict['upholstery'] = obj.item.upholstery

    return unpacked_dict
    

def query_assignments(data):
    query = Items_Sections.query
    
    if data['query_type'] == 'assign_sections':
        query = query.filter(Items_Sections.section_id == data['selected_section'])
        
    elif data['query_type'] == 'single':
        query = query.filter(Items_Sections.id == data['selected_assignment']).all()
    
    if data.get('assignment_state'):
        state = data['assignment_state']
        if 'not' in state:
            state = state.split('-')[1]
            query = query.filter(Items_Sections.state != state).all()
        else:
            query = query.filter(Items_Sections.state == state).all()

    
    count_results = {}
    assignment_list = []
    for assignment in query:
        unpacked_assignment = unpack_assignment(data['unpack_type'],assignment)
        assignment_list.append(unpacked_assignment)
    

    if data.get('sort'):
        if data['sort'] == 'by_storage':
            assignment_list = sort_by_storage(assignment_list)

    if data.get('get_counts'):
        column = getattr(Items_Sections,data['get_counts'],None)
        if column is None:
            raise Exception(f'No coulumn with name {data['get_counts']}')
        today = datetime.now(timezone.utc)
        range_date = timedelta(days=7)
        start_range = today - range_date
        
        results = (db.session.query(column, func.sum(
                                                        case(
                                                                (
                                                                    and_(
                                                                        column == 'Completed',
                                                                        Items_Sections.end_time >= start_range
                                                                        
                                                                    ),
                                                                    Items.quantity
                                                                ),
                                                            else_=case((column != 'Completed', Items.quantity), else_=0)
                                                        )
                                                    ))\
                   .join(Items,Items_Sections.item)\
                   .filter(Items_Sections.section_id == int(data['selected_section']))\
                   .group_by(column).all())
        count_results = dict(results)

    return assignment_list, count_results