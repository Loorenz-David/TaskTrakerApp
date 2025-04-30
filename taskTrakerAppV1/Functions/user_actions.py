from taskTrakerAppV1.models import Items_Sections, Tasks_Items,Sections, Items
from taskTrakerAppV1 import db
from datetime import datetime, timezone


def change_task_estate(data):

    query_task = Tasks_Items.query.get(int(data['task_id']))
    if query_task:
        query_task.is_completed = data['value']
    db.session.commit()
    print(data)
    return 'ok'
def is_utc(dt):
    return dt.tzinfo is not None and dt.tzinfo == timezone.utc

def record_action_time(data):
    query_item_section = Items_Sections.query.get(int(data['id']))

    if query_item_section:
        set_time = datetime.now(timezone.utc)
        setattr(query_item_section,data['value'],set_time)
        if data['value'] == 'end_time':
            start_time = query_item_section.start_time
            if start_time.tzinfo is None:
                start_time = start_time.replace(tzinfo=timezone.utc)
          
            duration = set_time - start_time
            query_item_section.total_duration = int(duration.total_seconds())
            query_item_section.is_completed = True

            next_section = query_item_section.section.section_order_indx + 1
            query_section = Items_Sections.query.join(Sections).filter(
                                                                        Items_Sections.item_id == query_item_section.item_id,
                                                                        Sections.section_order_indx == next_section
                                                                    ).all()
            if query_section:
                for section in query_section:
                    section.is_visible = True
            else:
                start_time_item = query_item_section.item.start_time
                if start_time_item.tzinfo is None:
                    start_time_item = start_time_item.replace(tzinfo=timezone.utc)
          
                query_item_section.item.is_completed = True
                query_item_section.item.end_time = set_time
                duration_item = set_time - start_time_item
                query_item_section.item.total_duration = int(duration_item.total_seconds())

            query_item_section.is_visible = False

        db.session.commit()

section_list = ['Dismantler','Cleaner','Upholstery Remover', 'Foam Installer','Upholstery Installer','Wood Frame Fixer','Remontering','Photography' ]
def add_items_db(data):

    new_item = Items(**data['item'])

    db.session.add(new_item)
    
    for section in data['selected_sections']:
        section_query = Sections.query.filter(Sections.section_name == section).first()
        
        assignment = Items_Sections(item=new_item,section=section_query)
        if len(data['selected_sections']) < len(section_list):
            assignment.is_visible = True
        elif section == 'Dismantler':
            assignment.is_visible = True
        db.session.add(assignment)

        for task in section_query.tasks:
            tasks_items = Tasks_Items( item=new_item, task=task )
            db.session.add(tasks_items)
    
    db.session.commit()

    return 'ok'