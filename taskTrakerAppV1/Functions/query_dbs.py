from taskTrakerAppV1 import models
from taskTrakerAppV1.models.sections_model import Storage_Unit, Sections

from sqlalchemy.orm import RelationshipProperty

columns_to_unpack_dict = {
                    'Users': 
                        {
                            'essentials':['id','username',{'relationship':'roles',
                                                                  'map':['role'],
                                                                  'column_target':['id','role_name']
                                                                  }
                                                            ,{'relationship':'assign_sections',
                                                                  'map':['section'],
                                                                  'column_target':['id','section_name']
                                                                  }
                                        ], 
                            'for_editing':['phone','email']
                        },
                    'Roles': 
                    {
                        'essentials':['id','role_name',{'relationship':'users',
                                                        'map':['user'],
                                                        'column_target':['id','username']
                                                        }
                                    ], 
                        'for_editing':[]
                    },
                    'Sections': 
                    {
                        'essentials':['id','section_name','section_icon',{'relationship':'assign_task',
                                                                            'map':['task'],
                                                                            'column_target':['id','task_name']
                                                                            }
                                    ], 
                        'for_editing':[{'relationship':'assign_task',
                                         'map':[],
                                         'column_target':['order_indx','task_id']}]
                    },
                    'Tasks': 
                    {
                        'essentials':['id','task_name','task_description',{'relationship':'assign_section',
                                                                            'map':['section'],
                                                                            'column_target':['id','section_name']
                                                                            }
                                    ], 
                        
                    },
                    'Storage_Unit': 
                    {
                        'essentials':['id','storage_number','storage_type','abreviation','capacity'], 
                        'for_editing':[]
                    },
                    'Pause_Reasons': 
                    {
                        'essentials':['id','pause_descriptions','is_work_related',{'relationship':'assign_sections',
                                                                                   'map':['section'],
                                                                                   'column_target':['id','section_name']}
                                    ], 
                        'for_editing':[]
                    },
                    

                        } 
# must think on how to fix the logic for creation an item class and item type
#'Items_Types_Classes': 
#                    {
#                        'essentials':['id','item_class',{'relationship':'item_type',
#                                                            'map':[],
#                                                            'column_target':['id','item_type']}
#                                    ], 
#                        'for_editing':[]
#                    },

def unpack_data(obj, model_name ,columns_to_unpack ,seen= None, ):


    
    
    
    print(columns_to_unpack,'debuggin roles')
    selected_dict_col = columns_to_unpack_dict.get(model_name,None)
    
    
    if not selected_dict_col:
        raise Exception('no columns to unpack found with that module name')
    
    results = {}
    mapper = obj.__mapper__

    
    for set_of_columns in columns_to_unpack:
        selected_list = selected_dict_col.get(set_of_columns)
        

        if not selected_list:
            raise Exception('no list found with that key')
        
        for column in selected_list:
            if isinstance(column,dict):
                relationship_name = column['relationship']
                value = getattr(obj,relationship_name)
                
                if isinstance(value,list):
                    results[relationship_name] = []
                    
                    for obj_rel  in value:
                        rel_dict = {}
                        target_obj = obj_rel
                        for map_key in column['map']:
                            target_obj = getattr(target_obj,map_key)

                        for column_rel in column['column_target']:
                            rel_dict[column_rel] =  getattr(target_obj,column_rel)
                        results[relationship_name].append(rel_dict) 
                else:
                    rel_dict = {}
                    target_obj = value
                    for map_key in column['map']:
                        target_obj = getattr(target_obj, map_key)
                    for column_rel in column['column_target']:
                        rel_dict[column_rel] = getattr(target_obj,column_rel)
                    results[relationship_name] = rel_dict
            else:

                
                results[column] = getattr(obj,column)
            
    
                

    return results

def query_dbs(data):
    model_name = data['model_name'].title()

    model = getattr(models, model_name,None)
    
    if not model:
        raise Exception('no model found with that name.')
    
    
    unpacked_data = None
    if data['query'] == 'all':
        query = model.query.all()
        print(model)
        print(query,'query all')
        unpacked_data = []
        for obj in query:
            unpacked_data.append(unpack_data(obj,model_name,data['columns_to_unpack']))
        
    if data['query'] == 'item_by_id':
        
        query = model.query.get(int(data['item_id']))
        unpacked_data = unpack_data(query,model_name,data['columns_to_unpack'])
    
    return unpacked_data


def get_storages():

    query_storages = Storage_Unit.query.all()
    storage_dict = {}
    storage_types = []
    for storage in query_storages:
        storage_type  = storage.storage_type
        if storage_type not in storage_dict or len(storage_dict.keys()) == 0:
            storage_dict[storage_type] = []
            storage_types.append(storage_type)
        
        storage_value = f'{storage.abreviation}-{storage.storage_number}'
        
        storage_dict[storage_type].append(storage_value)


    return storage_dict, storage_types

def get_sections():

    query_sections = Sections.query.all()
    sections_list = []
    for section in query_sections:
        temp_dict = {'section_name':section.section_name,
                     'id':section.id}
        sections_list.append(temp_dict)

    return sections_list