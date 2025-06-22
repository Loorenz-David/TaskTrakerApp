
async function query_assignments(fetchDict){
    response = await request_handler('main','get_items',fetchDict)
    if (response['status'] == 'confirmation'){
        fetch_message(response)
        
        Data = response['data']
        Data = sortTrolleyList(Data)

        // fixing item count state
        
        if('data_count' in response){
            itemCounts = response['data_count']
            
            load_item_counts(itemCounts)
        }
        
        let flatList = Data.flatMap(([storageName,items]) => items)
        dataMap = new Map(flatList.map(obj =>[obj.id, obj] ))
        load_item_query(Data)
        
        
    }
    else{
        fetch_message(response)
    }
    console.log(Data,'Data')
    console.log(dataMap,'data_maps')
}



document.addEventListener('DOMContentLoaded', function (){
    
    let selectedId = get_selected_section_id()

     const fetchDictFirstLoad = {
                                'page':'working_sections',
                                'query_type':'assign_sections',
                                'selected_section': selectedId,
                                'assignment_state':'not-Completed',
                                'unpack_type':'essentials',
                                'sort':'by_storage',
                                'get_counts':'state'}


    query_assignments(fetchDictFirstLoad)
})


