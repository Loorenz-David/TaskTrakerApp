from taskTrakerAppV1.models import Items_Sections, Sections, Items
from taskTrakerAppV1 import db
from datetime import datetime, timedelta

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
        
        
        itemDict = {
            'id':row.id,
            'is_completed':row.is_completed,
            'is_visible':row.is_visible,
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
        dateTo_to_query = datetime.strptime(data['datae_to'],'%Y-%m-%d')


   
    query = Items_Sections.query

 

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

        results[section] = {'total_active_items':0}
        for item in activeItems_ls:
            results[section]['total_active_items'] += int(item.item.quantity)

        total_time = 0
        results[section]['completed_items'] = 0
        for item in completed_items:
            results[section]['completed_items'] += int(item.item.quantity)
            total_time += int(item.total_duration)

        print(total_time)
        if total_time > 0 :
            results[section]['average_time_seconds'] = total_time // results[section]['completed_items']
        else:
            results[section]['average_time_seconds'] = 0
        print(results)





    return results