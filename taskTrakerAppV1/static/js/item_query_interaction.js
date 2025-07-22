
const templateStorageContainer = document.getElementById('TemplateStorageContianer')
const templateItemContainer = document.getElementById('TemplateItemContainer')
const templateQueryResults = document.getElementById('TemplateQueryResults')
const templateSectionIcons = document.getElementById('TemplateSectionsIcons')
const queryResultsContainer = document.getElementById('queryResults')
const dataCountDisplay = document.querySelectorAll('[data-display]')
const inputQuerySearch = document.getElementById('inputQuery')
const pageForQueryFilters = document.getElementById('pageForQueryFilters')
const filtersState = document.getElementById('filtersState')
const btnSaveFiltersQuery = document.getElementById('btnSaveFiltersQuery')
const btnClearFiltersQuery = document.getElementById('btnClearFilters')
const inputQueryType = inputQuerySearch.getAttribute('query-type')
const statusContainer = document.getElementById('statusContainer')

let Data;
let dataMap;
let itemCounts = {}
let inputQueryData = []

let queryFiltersActive = false
let queryFiltersDict = {'for_display':{},'for_query':{}}


// localStorage has a dict store in saveQueryFilters
// EXAMPLE {'key':{'attribute':name of attribute in element,'value':the value selected}}

function checkFilterValue(key, storageDict,filter_for){
    let filterValue = queryFiltersDict[filter_for]?.[key]?.value

    if(!storageDict[filter_for]){
        storageDict[filter_for] = {}
    }

    if(filterValue){
        console.log(filterValue,'filter value')
        storageDict[filter_for][key] = queryFiltersDict[filter_for][key]
    }else{
        delete storageDict[filter_for][key]
    }
    console.log(storageDict,'store dict')

    // if(key in storageDict[filter_for]){
    //     if(!queryFiltersDict[filter_for][key]['value']){
    //         delete storageDict[filter_for][key]

    //     }
    //     else{
    //         storageDict[filter_for][key]['value'] = queryFiltersDict[filter_for][key]['value']
    //     }
    // }else{
    //     if(queryFiltersDict[filter_for][key]['value']){
    //         storageDict[filter_for][key] = queryFiltersDict[filter_for][key]
    //     }
    // }
    return storageDict
}

function saveFiltersToStorage(targetKey=undefined,filter_for=undefined){
    let filterKeys = Object.keys(queryFiltersDict[filter_for])
    if(filterKeys.length == 0) return;
    console.log(filterKeys,'keys')
    let storeFilters = JSON.parse(localStorage.getItem('saveQueryFilters') || '{"for_display":{},"for_query":{}}') 
    
    storeFilters = checkFilterValue(targetKey,storeFilters,filter_for)
    
    localStorage.setItem('saveQueryFilters',JSON.stringify(storeFilters))

}


function open_close_target_storage(targetStorage,open){
    let storageArrow = targetStorage.querySelector('.arrow')
    let storageItems = targetStorage.querySelector('[data-value="itemsContainerList"]')
    let storageTitle = targetStorage.querySelector('.storage-title-container')
    if(!storageTitle.classList.contains('hide')){
        storageArrow.classList.toggle('open',open)
        storageItems.classList.toggle('show',open)
    }
    
}


function toggleStorages(open=true){
    let allStorages = queryResultsContainer.querySelectorAll('.storageContainer').forEach(storage =>{
         open_close_target_storage(storage,open)
    })
    
}

function hide_storages(hide=true){
    let allStorages = queryResultsContainer.querySelectorAll('.storageContainer').forEach(storage=>{
        let storageTitle = storage.querySelector('.storage-title-container')
            if(hide){
                open_close_target_storage(storage,true)
                if(!(storageTitle.classList.contains('hide'))){
                    storageTitle.classList.add('hide')
                }
            }
            else{   
                if(storageTitle.classList.contains('hide')){
                    storageTitle.classList.remove('hide')
                }
                open_close_target_storage(storage,false)
            }
    })
    
    
}

let displayFiltersMap = {'open_storages':toggleStorages,
                            'hide_storages':hide_storages,
}





function activateFilters(targetKey,filter_for,value){
     if(filter_for == 'for_display'){
            let functionForInteraction = displayFiltersMap[targetKey]
            
            functionForInteraction(value)
        }
}

function loadFilterMemory(){
    queryFiltersDict = JSON.parse(localStorage.getItem('saveQueryFilters' ) ||  '{"for_display":{},"for_query":{}}')
    let forDisplayKeys = Object.keys(queryFiltersDict['for_display'])
    let forQueryKeys = Object.keys(queryFiltersDict['for_query'])

    if(forDisplayKeys.length > 0){
        queryFiltersActive = true
        forDisplayKeys.forEach(key =>{
            let filterDict = queryFiltersDict['for_display'][key]
           
            let targetElement = pageForQueryFilters.querySelector(`[${filterDict['attribute']}="${key}"]`)

            if(targetElement && targetElement.type == 'checkbox'){
                targetElement.checked = filterDict['value']
            }
        })

    }
    if(forQueryKeys.length > 0){
        queryFiltersActive = true
        filtersState.innerHTML = 'Applying'
        forQueryKeys.forEach(key=>{
            let filterDict = queryFiltersDict['for_query'][key]
            let targetElement = pageForQueryFilters.querySelector(`[${filterDict['attribute']} = "${key}"]`)
            console.log(targetElement,'taget Element')
            if(targetElement){
                targetElement.value = filterDict['value']
            }
        })
        

    }

   
}
if(pageForQueryFilters){
    pageForQueryFilters.addEventListener('click',(e)=>{
        let interactedWithFilter = false
        let targetKey;
        let currentTarget = e.target
        let value;
        
        let filter_for = currentTarget.getAttribute('filter-for')
        if(filter_for){
            

            // this is the case if filter_for is display and checkbox
            if(currentTarget.getAttribute('filter-display-checkbox')){
                value = currentTarget.checked
                targetKey = currentTarget.getAttribute('filter-display-checkbox')
                queryFiltersDict[filter_for][targetKey] ={'attribute':'filter-display-checkbox',
                                                            'value': value
                                                            }
                interactedWithFilter = true
            }

           
        }
        
        if(interactedWithFilter){
            
            saveFiltersToStorage(targetKey,filter_for)
            activateFilters(targetKey,filter_for,value)
        }  
        
    })



    document.addEventListener('DOMContentLoaded',function(){
    loadFilterMemory()
    console.log('happend before')
})
}






function clearQuery(){
    queryResultsContainer.innerHTML = ''
    

}
function sortTrolleyList(data){
    
    const sortedGroupedEntries = Object.entries(data).sort((a, b) => {
        const dateA = new Date(a[1][0]?.due_date || '9999-12-31');
        const dateB = new Date(b[1][0]?.due_date || '9999-12-31');
        return dateA - dateB;
});
return sortedGroupedEntries
}

function load_item_query(data = undefined){
    clearQuery()
    let selectedData;
    if(data){
        selectedData = data
    }
    else{
        selectedData = Data
    }
   
   
    
    
    selectedData.forEach(([storage, items]) =>{
        let cloneStorageContainer = templateStorageContainer.content.cloneNode(true)
        cloneStorageContainer.querySelector('#StorageName').innerHTML = storage
        let storageItemListContainer = cloneStorageContainer.querySelector('[data-value="itemsContainerList"]')
        
        if(queryFiltersActive){

            if('open_storages' in queryFiltersDict['for_display']){
               
                    let storageArrow = cloneStorageContainer.querySelector('.arrow')
                    storageArrow.classList.add('open')
                    storageItemListContainer.classList.add('show')
                
            }

            if('hide_storages' in queryFiltersDict['for_display']){
                
                    let storagetitleContainer = cloneStorageContainer.querySelector('.storage-title-container')
                    storagetitleContainer.classList.add('hide')
                    storageItemListContainer.classList.add('show')
                
            }


           
        }

        items.forEach(item =>{
            let cloneItemContainer = templateItemContainer.content.cloneNode(true)
            let imagesUrl = item.images_url?.[0]
            
            let itemContainer = cloneItemContainer.querySelector('[data-value="itemContainer"]')
            itemContainer.setAttribute('data-id',item.id)
            
            if(imagesUrl){
               
                cloneItemContainer.querySelector("[data-value='itemImage']").src = imagesUrl
            }
            if(item.due_date){
                let dueDateElement = cloneItemContainer.querySelector("[data-value='due_date']")
                dueDateElement.innerHTML = item.due_date
                if(item.due_date){
                    markDueDate(item.due_date,dueDateElement)
                }
                
            }
            if(item.assign_sections){
                let workingStatusesContainer = cloneItemContainer.querySelector("[data-value='workingStatusesContainer']")
                let cloneIcons = templateSectionIcons.content.cloneNode(true)
                
                let sorted_assign_sections = item.assign_sections.sort((a,b) => a.section_order - b.section_order)
                sorted_assign_sections.forEach(section =>{
                    
                    let targetIcon = cloneIcons.querySelector(`[id-value = "${section.section_name}"]`)
                    
                    if(!targetIcon){
                        let replacement = document.createElement('span')
                        replacement.style.fontSize = '18px'
                        replacement.innerHTML = section.section_name[0]
                        targetIcon = replacement
                    }

                    let iconContainer = document.createElement('div')
                    iconContainer.classList.add(`section-status`)
                    iconContainer.classList.add(`status-${section.state}`)

                    if(section.state === 'Working' ){
                        iconContainer.classList.add('twinkle')
                    }
                    iconContainer.appendChild(targetIcon)

                    workingStatusesContainer.appendChild(iconContainer)
                })
                
            }

            cloneItemContainer.querySelector("[data-value='article_number']").innerHTML = item.article_number

            storageItemListContainer.appendChild(cloneItemContainer)
        })

        queryResultsContainer.appendChild(cloneStorageContainer)
    })
    
    
}

function load_item_counts(dataCounts){
    
    dataCountDisplay.forEach((displayElement) =>{
        displayElement.innerHTML = ''
    })
    let dataCountsKeys = Object.keys(dataCounts)
     if(dataCountsKeys.length > 0){
        dataCountDisplay.forEach((displayElement)=>{
            let displayName = displayElement.getAttribute('data-display')
            if(displayName == 'Total'){
                let totalCount  = 0
                dataCountsKeys.forEach(key => {
                    totalCount += dataCounts[key]
                })
                dataCounts['Total'] = totalCount

            }
            
            let countValue = 0
            if(displayName in dataCounts){
                countValue = dataCounts[displayName]
            }
            
            displayElement.innerHTML = countValue
            console.log(displayElement)
        })
    }
}



async function first_load_query(fetchDict,pagination=false){
    
    response = await request_handler('main','get_items',fetchDict)
    if (response['status'] == 'confirmation'){
        fetch_message(response)
        
        Data = response['data']
        Data = sortTrolleyList(Data)
       
        if('data_count' in response){
            itemCounts = response['data_count']
            
            load_item_counts(itemCounts)
        }

        
        let flatList = Data.flatMap(([storageName,items]) => items)
        dataMap = new Map(flatList.map(obj =>[obj.id, obj] ))
        load_item_query(Data)

        if(pagination){
            totalPageCount = response['total_pages']
            totalPageCountElement.textContent = totalPageCount
            localStorage.setItem('page_main_db',currentPageCount)
            if(totalPageCount == currentPageCount){
                nextPage.classList.add('hide')
                btnHid = nextPage
            }
            
        }
        
    }
    else{
        fetch_message(response)
    }
    
   
}

queryResultsContainer.addEventListener('click',function(e){
    let targetStorageContainer = e.target.closest('#StorageContainer')

    let itemContainer = e.target.closest('[data-value="itemContainer"]')
    let titleStorageContainer = e.target.closest('.storage-title-container')
    

    if(titleStorageContainer  &&  this.contains(titleStorageContainer)){
        let itemContainerList = targetStorageContainer.querySelector('[data-value="itemsContainerList"]')
        targetStorageContainer.querySelector('.arrow').classList.toggle('open')
        itemContainerList.classList.toggle('show')
    }
   
    if(itemContainer && this.contains(itemContainer)){
        let targetDataId =  itemContainer.getAttribute('data-id')
        let targetData = dataMap.get(Number(targetDataId))
        if(targetData){
            load_selected_item(targetData,targetDataId)
        }
        
    }

})



async function input_query(){

    let value = inputQuerySearch.value
    

    
    if(value !== ''){
        inputQueryData = []
        if(inputQueryType == 'front_end_query'){
            
            inputQueryData = Data.map(([storage,objArray]) =>{

            const matches = objArray.filter(obj => obj.article_number.includes(value))
            return matches.length ? [storage,matches] : null
            
            }).filter( entry => entry !== null)
        }
        else if(inputQueryType == 'back_end_query'){

            console.log('checking back end query')
            let inputQueryFetchDict = {'query_type':'input_query',
                                        'unpack_type':'essentials',
                                        'sort':'by_storage',
                                        'input_query': value
                                        }
            let response = await request_handler('main','get_items',inputQueryFetchDict)
            if(response){
                if(response['status'] == 'confirmation'){
                   
                    let queryData = response['data']
                    inputQueryData = sortTrolleyList(queryData)
                    console.log(inputQueryData)
                    
                    
                }
            }
            if(paginationContainer){
                if(!paginationContainer.classList.contains('hide')){
                    paginationContainer.classList.add('hide')
                }
                
            }

        }
        
        load_item_query(inputQueryData)
    }else{
        inputQueryData = []

        load_item_query(Data)

        if(paginationContainer){
            paginationContainer.classList.remove('hide')
        }
    }
}

inputQuerySearch.addEventListener('input',(e)=>{
    
    input_query()
})



function calculateDate(firstDate,secondDate,limit = undefined){
    firstDate.setHours(0, 0, 0, 0);
    secondDate.setHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInMs = secondDate - firstDate ;
    const diffInDays = Math.floor(diffInMs / msPerDay);

    return diffInDays;
}

function markDueDate(stringDate,targetElement){
     const today = new Date()
    const targetDate = new Date(stringDate)
    let days_remaining = calculateDate(today,targetDate)
    
    if(days_remaining < 4 && days_remaining >= 0){
       
        targetElement.classList.add('twinkle-color')
    }
}

if(btnSaveFiltersQuery){
    btnSaveFiltersQuery.addEventListener('click',(e)=>{
        let interactedWithFilter = false
        const allFilterQuerys = pageForQueryFilters.querySelectorAll('[filter-column]').forEach(input =>{
            let value = input.value
            let columnTarget = input.getAttribute('filter-column')
            queryFiltersDict['for_query'][columnTarget] = {'attribute':'filter-column',
                                                        'value': value
                }
            if(value !== ''){ 
                saveFiltersToStorage(columnTarget,'for_query')
                interactedWithFilter = true
            
            }else{
                saveFiltersToStorage(columnTarget,'for_query')
                delete queryFiltersDict['for_query'][columnTarget]
                
            }

        
        })
        
            location.reload()
    })

    

}
if(btnClearFiltersQuery){
    btnClearFiltersQuery.addEventListener('click',(e)=>{
            const allFilterQuerys = pageForQueryFilters.querySelectorAll('[filter-column]').forEach(input =>{
            let value = ''
            input.value = ''
            let columnTarget = input.getAttribute('filter-column')
            queryFiltersDict['for_query'][columnTarget] = {'attribute':'filter-column',
                                                        'value': value
                }
            if(value !== ''){ 
                saveFiltersToStorage(columnTarget,'for_query')
                interactedWithFilter = true
            
            }else{
                saveFiltersToStorage(columnTarget,'for_query')
                delete queryFiltersDict['for_query'][columnTarget]
                
            }

             location.reload()
        })
    })
}



let selectedStatusList = []

function filterDataByStatus(data){
    let filteredData  = []
    console.log(data,'tageted these data -------',selectedStatusList)
    if(selectedStatusList.length > 0){
        filteredData = data.map(([storages,objArray]) => {
            const matches = objArray.filter(obj => selectedStatusList.includes(obj.state))
            return matches.length ? [storages,matches] : null
            }).filter(entry => entry !== null)
    }else{
        filteredData = data
    }

    

    return filteredData

}

function clearStatusContainer(){
    selectedStatusList = []
    let allStatusContainers = statusContainer.querySelectorAll('[status-value]').forEach(container =>{
        container.setAttribute('is-active','false')
        if(container.classList.contains('selected-span')){
            container.classList.remove('selected-span')
        }
    }) 
}

statusContainer.addEventListener('click',async (e)=>{
   
    let clickOn = e.target
    let targetElement = clickOn.closest('[status-value]')

    if(targetElement){
        let statusValue = targetElement.getAttribute('status-value')
        let isActive = targetElement.getAttribute('is-active')
        
        if(isActive === 'true'){
            let index = selectedStatusList.indexOf(statusValue)
            if(index !== -1){
                selectedStatusList.splice(index,1)
            }
            targetElement.setAttribute('is-active','false')
            targetElement.classList.remove('selected-span')
        }
        else if (isActive === 'false'){

            // id completed is selected .... else if completed is in list, 
            // completed is a query to back end, thus is treated independantly
            if(statusValue == 'Completed'){
               clearStatusContainer()
            }
            else{
                if(selectedStatusList.includes('Completed')){
                    let completedContainer = statusContainer.querySelector('[status-value = "Completed"]')
                    completedContainer.setAttribute('is-active','false')
                    completedContainer.classList.remove('selected-span')
                    selectedStatusList = []
                }
            }
            
            selectedStatusList.push(statusValue)
            targetElement.setAttribute('is-active','true')
            targetElement.classList.add('selected-span')
            
        }
       

        let filteredData;

        
        if(statusValue == 'Completed' && inputQueryType == 'front_end_query'){
            let selectedId = get_selected_section_id()
            const fetchDictCompleted = {
                                'page':'working_sections',
                                'query_type':'assign_sections',
                                'selected_section': selectedId,
                                'assignment_state':['Completed'],
                                'unpack_type':'essentials',
                                'sort':'by_storage'}
            let response = await request_handler('main','get_items',fetchDictCompleted)
            if(response){
                console.log(response)
                if(response['status'] == 'confirmation'){
                    filteredData = sortTrolleyList(response['data'])
                }
            }

        }else{
            if(inputQueryData.length > 0){
                filteredData = filterDataByStatus(inputQueryData)
            }else{
                
                filteredData = filterDataByStatus(Data)
            }
        }

        
        load_item_query(filteredData)
        

        
        
        
    }

})




