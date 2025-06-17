
const templateStorageContainer = document.getElementById('TemplateStorageContianer')
const templateItemContainer = document.getElementById('TemplateItemContainer')
const templateQueryResults = document.getElementById('TemplateQueryResults')
const templateSectionIcons = document.getElementById('TemplateSectionsIcons')
const queryResultsContainer = document.getElementById('queryResults')
const dataCountDisplay = document.querySelectorAll('[data-display]')
const inputQuerySearch = document.getElementById('inputQuery')
let Data;
let dataMap;
let itemCounts = {}


function clearQuery(){
    queryResultsContainer.innerHTML = ''
    dataCountDisplay.forEach((displayElement) =>{
        displayElement.innerHTML = ''
    })

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
    console.log(selectedData,'selected data')
    if(Object.keys(itemCounts).length > 0){
        dataCountDisplay.forEach((displayElement)=>{
            let displayName = displayElement.getAttribute('data-display')
            let countValue = 0
            if(displayName in itemCounts){
                countValue = itemCounts[displayName]
            }
            
            displayElement.innerHTML = countValue
        })
    }
    
    
    selectedData.forEach(([storage, items]) =>{
        let cloneStorageContainer = templateStorageContainer.content.cloneNode(true)
        cloneStorageContainer.querySelector('#StorageName').innerHTML = storage
        let storageItemListContainer = cloneStorageContainer.querySelector('[data-value="itemsContainerList"]')
       
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

                item.assign_sections.forEach(section =>{
                    
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

function load_item_counts(data){

}



async function first_load_query(fetchDict){
    
    response = await request_handler('main','get_items',fetchDict)
    if (response['status'] == 'confirmation'){
        fetch_message(response)
        
        Data = response['data']
        Data = sortTrolleyList(Data)
       
        if('data_count' in response){
            itemCounts = response['data_count']
            console.log(itemCounts,'data counts!!')
        }

        
        let flatList = Data.flatMap(([storageName,items]) => items)
        dataMap = new Map(flatList.map(obj =>[obj.id, obj] ))
        load_item_query(Data)
        
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



function input_query(){

    let value = inputQuerySearch.value
    console.log(value)
    if(value.length > 0){
        let filterdData = Data.map(([storage,objArray]) =>{
            const matches = objArray.filter(obj => obj.article_number.includes(value))
            return matches.length ? [storage,matches] : null
        }).filter( entry => entry !== null)
        load_item_query(filterdData)
    }else{
        load_item_query(Data)
    }
}

inputQuerySearch.addEventListener('input',(e)=>{
    console.log(e)
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




