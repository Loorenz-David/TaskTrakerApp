from taskTrakerAppV1 import models, db


def set_relationships(relationships,model,target_row):
     for rel in relationships:
            target_model = getattr(models, rel['target_model'].title())
            print(target_model,'targeting relation ship --------------------------------')
            if not target_model:
                raise Exception('no target model with that name')
            
            # if the relation ship is many to many
            if rel.get('many_to_many',None):
                    assoc_model = getattr(models,rel['many_to_many'])
                    print(assoc_model,'assositated --------------------------------')
                    if not assoc_model:
                        raise Exception('no model many to many with that name.')
                    
                    values = rel.get('values',[])

                    fk_map = {}
                    for column in assoc_model.__table__.columns:
                        for fk in column.foreign_keys:
                            target_class = fk.column.table.name
                            fk_map[target_class] = column.name
                    
                    new_row_table = model.__tablename__
                    target_table = target_model.__tablename__

                    fk_to_new_row = fk_map.get(new_row_table)
                    fk_to_target = fk_map.get(target_table)

                    if not fk_to_new_row or not fk_to_target:
                        raise Exception(f"could not find match foreign keys in {assoc_model.__tablename__}")

                    for target_id in values:
                        assoc_row = assoc_model()
                        if(isinstance(target_id,dict)):
                            setattr(assoc_row,target_id['column_in_relation'],int(target_id['value_in_relation']))
                            target_id = target_id['value']
                        
                           
                        setattr(assoc_row, fk_to_new_row,target_row.id)
                        setattr(assoc_row, fk_to_target, int(target_id))
                        db.session.add(assoc_row)

        # missing to build logic if the relationship is one way -----
        # for rel in relationships:
        #     query_target_relationships = target_model.query.filter(target_model.id.in_(rel['values']) ).all()


def remove_relationships(relationships,target_row):
     
    row_class = target_row.__class__
    row_id = target_row.id

    for rel in relationships:

        target_model_name = ''
        if rel.get('many_to_many',None):
            target_model_name = rel['many_to_many']

        # missing to fix logic for one to many relationships
        #     for rel in relationships:
        #      target_model_name = rel.get('many_to_many') or rel.get('one_to_many')

        target_model = getattr(models,target_model_name,None)
        if not target_model:
            raise Exception('no target model with that name')

        matched_fk_field = None
        for col in target_model.__table__.columns:
            if col.foreign_keys:
                for fk in col.foreign_keys:
                    if fk.column.table.name == row_class.__tablename__:
                        matched_fk_field = col.name
                        break
            if matched_fk_field:
                break
        
        if not matched_fk_field:
            raise Exception('no foreign key match')
        
        target_column = getattr(target_model,matched_fk_field)
        links = target_model.query.filter(target_column == row_id).all()

        if rel.get('many_to_many',None):
            for link in links:
                db.session.delete(link)
        # missing to fix logic for one to many relationships

    db.session.commit()


def create_in_db(data):

    model = getattr(models,data['model_name'],None)

    if not model:
        raise Exception('no model found with that name')
    
    fields = data.get('fields',{})
    relationships = data.get('relationships',{})

    new_row = model(**fields)
    db.session.add(new_row)
    db.session.flush()

    
    if relationships:
       set_relationships(relationships=relationships,
                         model=model,
                         target_row= new_row)

    db.session.commit()

            

    # db.session.add(new_row)


def edit_in_db(data):   

    model = getattr(models,data['model_name'],None)

    if not model:
        raise Exception('no model found with that name')
    
    fields = data.get('fields',{})
    relationships = data.get('relationships',{})

    query_row = model.query.get(int(data['item_id']))

    for key_input in fields:
         setattr(query_row,key_input,fields[key_input])


    if relationships:
         remove_relationships(relationships=relationships,
                              target_row=query_row)
         
         set_relationships(relationships=relationships,
                           model=model,
                           target_row=query_row)
         
    

    db.session.commit()


def delete_in_db(data):

    model = getattr(models,data['model_name'],None)
    if not model:
        raise Exception(f'no model with name: {data["model_name"]}')
    
    query = model.query.get(int(data['item_id']))
    if not query:
        raise Exception(f'no match found for id {data["item_id"]}')
    
    
    db.session.delete(query)
    db.session.commit()