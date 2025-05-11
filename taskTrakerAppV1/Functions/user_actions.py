from taskTrakerAppV1.models import Items_Sections, Tasks_Items,Sections, Items, Items_Sections_Pauses
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

        if 'pause' in data['value']:
            if 'start' in data['value']:
                new_pause = Items_Sections_Pauses()
                new_pause.association_section = query_item_section
                new_pause.start_time_pause = set_time
                new_pause.pause_reason = data['pause_reason']
                db.session.add(new_pause)

                query_item_section.is_paused = True
            elif 'end' in data['value']:
                query_pause = Items_Sections_Pauses.query.filter(Items_Sections_Pauses.item_section_id == query_item_section.id,
                                                                 Items_Sections_Pauses.end_time_pause == None).first()
                query_pause.end_time_pause = set_time
                query_item_section.is_paused = False

        else:
            setattr(query_item_section,data['value'],set_time)
            if data['value'] == 'end_time':
                start_time = query_item_section.start_time
                if start_time.tzinfo is None:
                    start_time = start_time.replace(tzinfo=timezone.utc)
            
                duration = set_time - start_time
                query_item_section.total_duration = int(duration.total_seconds())
                query_item_section.is_completed = True
                query_item_section.is_visible = False

                next_addition = 1
                if query_item_section.section.section_name == 'Wood Frame Fixer':
                    next_addition = 3
                elif query_item_section.section.section_name == 'Upholstery Remover':
                    next_addition = 2

                next_section = query_item_section.section.section_order_indx + next_addition
                query_section = Items_Sections.query.join(Sections).filter(
                                                                            Items_Sections.item_id == query_item_section.item_id,
                                                                            Sections.section_order_indx == next_section
                                                                        ).all()
                if query_section:
                    for section in query_section:
                        
                        if section.section.section_name == 'Remontering':
                        
                            join_query =  Items_Sections.query.join(Sections)
                            query_wood_worker = join_query.filter(Items_Sections.item_id == query_item_section.item_id,
                                                                Sections.section_name == 'Wood Frame Fixer').first()
                            query_upholstery_installer =  join_query.filter(Items_Sections.item_id == query_item_section.item_id,
                                                                            Sections.section_name == 'Upholstery Installer').first()
                            if not query_wood_worker.is_completed :
                                db.session.commit()
                                return "Wood Frame Fixer haven't finished with the chair frame."

                            if not query_upholstery_installer.is_completed :
                                db.session.commit()
                                return "Upholstery Installer haven't finished Uplholstering."

                        section.is_visible = True

                else:
                    start_time_item = query_item_section.item.start_time
                    if start_time_item.tzinfo is None:
                        start_time_item = start_time_item.replace(tzinfo=timezone.utc)
            
                    query_item_section.item.is_completed = True
                    query_item_section.item.end_time = set_time
                    duration_item = set_time - start_time_item
                    query_item_section.item.total_duration = int(duration_item.total_seconds())

                

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