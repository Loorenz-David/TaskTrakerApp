from taskTrakerAppV1.models import Items_Sections, Sections, Items
from taskTrakerAppV1 import db
from datetime import datetime, timedelta, timezone

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

        
            
        
        print(results)
    if general_stats_raw_total_time > 0:
        results['general_stats']['average_raw_item_seconds'] =  results['general_stats']['completed_items'] / general_stats_raw_total_time 
        results['general_stats']['average_pause_time'] = general_stats_work_pause_time / general_stats_pause_events
        results['general_stats']['average_real_item_seconds'] = results['general_stats']['completed_items'] / ( general_stats_raw_total_time - general_stats_raw_pause_time)




    return results