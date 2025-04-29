from taskTrakerAppV1.models import Items_Sections, Sections
from taskTrakerAppV1 import db

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
                      
                       },
            'tasks':tasks
        }
        results.append(itemDict)
        

    return results

