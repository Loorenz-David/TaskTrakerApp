
let sectionList = ulSections.querySelectorAll('li')
let itemsList = document.getElementById('containerItemsList')
let itemsData;

let selectedSectionLi;
sectionList.forEach((section)=>{
    section.addEventListener('click',(e)=>{
        
        selectedSectionLi = e.currentTarget.querySelector('span').textContent
        
        
        setPageForSelection(selectedSectionLi,true)
    })
})

const trolleyTemplate = document.getElementById('trolleyContainer')
const itemTemplate = document.getElementById('itemElement')
function loadItemsDataList(dataDictList){
    itemsList.innerHTML = ''
    Object.keys(dataDictList).forEach((key)=>{
        let trollyClone = trolleyTemplate.content.cloneNode(true)
        let trollyList = trollyClone.querySelector("[data-value='trolleyItemsList']")
        
        trollyClone.querySelector("[data-value='trolley']").textContent = key

        dataDictList[key].forEach((item,index)=>{
            let itemClone = itemTemplate.content.cloneNode(true)
            itemClone.querySelector("[data-value='article_number']").textContent = item['item']['article_number']
            let itemContainer = itemClone.querySelector('.itemElement')
            itemContainer.setAttribute('data-id',`${item['id']}`)
            if(item['start_time'] ){
                add_start_item_list(itemContainer)
                if(item['is_paused'] == true){
                    add_pause_item_list(itemContainer)
                }
                
            }

            trollyList.appendChild(itemClone)
        })
        itemsList.appendChild(trollyClone)
    })
}


function add_start_item_list(element){
    let hasStartedElement = document.createElement('div')
    let spanStarted = document.createElement('span')
    hasStartedElement.classList.add('item-status','bg-green')
    spanStarted.textContent = 'Started'

    hasStartedElement.setAttribute('status-id','started')
    hasStartedElement.appendChild(spanStarted)
    element.appendChild(hasStartedElement)

    let hasPausedElement = document.createElement('div')
    let spanPaused = document.createElement('span')
    hasPausedElement.classList.add('item-status','bg-blue')
    spanPaused.textContent = 'Paused'
    
    hasPausedElement.style.display = 'none'
    hasPausedElement.setAttribute('status-id','paused')
    hasPausedElement.appendChild(spanPaused)
    element.appendChild(hasPausedElement)

}

function add_pause_item_list(element){
    let pausedElement = element.querySelector(`[status-id='paused']`)
    let startedElement = element.querySelector(`[status-id='started']`)
    pausedElement.style.display = 'block'
    startedElement.style.display = 'none' 
   
}

function remove_pause_item_list(element){
    let pausedElement = element.querySelector(`[status-id='paused']`)
    let startedElement = element.querySelector(`[status-id='started']`)
    pausedElement.style.display = 'none'
    startedElement.style.display = 'block'
}


// completed items is a variable store in localstorage, it is reset every day
let totalItemsCompleted = 0
let totalItemsCount= {'itemCountActive':0,'itemCountStarted':0,'itemCountPaused':0}
let modifiedCounts = []

function updateItemsCompleted(store=false){
    let completedElement = document.getElementById('itemCountCompleted')
    completedElement.textContent = totalItemsCompleted
    if(store){
        localStorage.setItem(`${selectedSectionLi}itemCountCompleted`,totalItemsCompleted)
    }
    
}

function update_count_items(){
    modifiedCounts.forEach((countName)=>{
        
            let countElement = document.getElementById(`${countName}`)
            countElement.textContent = `${totalItemsCount[countName]}`
        
        
    })
    modifiedCounts = []
}

function resetTotalItemsCount(){
    for(const count in totalItemsCount){
        console.log(count)
        totalItemsCount[count] = 0
        modifiedCounts.push(count)
    
    }
    totalItemsCompleted = 0
    updateItemsCompleted()
    update_count_items()
}

function count_items(item){
    let itemQuantity = item.item.quantity

    if(item.start_time ){
        if(!item.is_paused){
            totalItemsCount['itemCountStarted'] +=  parseInt(itemQuantity)
            if(!modifiedCounts.includes('itemCountStarted')){
                modifiedCounts.push('itemCountStarted')
            }
        } 
    }
    else{
        totalItemsCount['itemCountActive'] += parseInt(itemQuantity)
        if(!modifiedCounts.includes('itemCountActive')){
        modifiedCounts.push('itemCountActive')
        }
    }
   
    if(item.is_paused){
        totalItemsCount['itemCountPaused'] += parseInt(itemQuantity)
        if(!modifiedCounts.includes('itemCountPaused')){
        modifiedCounts.push('itemCountPaused')
        }
    }
    
    
    

}

function loadItemsList(dataList,query=false){
   
    sortedByTrolleys = dataList.reduce((acc,item)=>{
        count_items(item)
        let key = item.trolley;
        if(!key){
            key='No-Trolley'
        }
        if(!acc[key]){
            acc[key] = []
        }

        acc[key].push(item)
        return acc
        },{})

    if(!query){
        itemsData = sortedByTrolleys
    }

    let itemCompletedCount = localStorage.getItem(`${selectedSectionLi}itemCountCompleted`)
    if(itemCompletedCount){
        totalItemsCompleted = Number(itemCompletedCount)
        updateItemsCompleted()
    }
    update_count_items()
    loadItemsDataList(sortedByTrolleys)
}

const queryInput = document.getElementById('articleNumberInput')
queryInput.addEventListener('input',(e)=>{
    if(itemsData){
        let valueInput = queryInput.value
    let dictKeys = Object.keys(itemsData)
    let matches = []
    if (valueInput.length > 0){
        dictKeys.forEach((key)=>{
            let match = itemsData[key].filter(item => item.item.article_number.includes(valueInput) )
            if(match.length > 0){
                matches.push(...match)
            }
        })
        
        loadItemsList(matches,true)
    
    }
    else{
        loadItemsDataList(itemsData)
    }
    }
   

})




const sectionTitle = document.getElementById('headerSelection')


async function setPageForSelection(selectedSection,toggleMenu=true){
    
    itemsList.innerHTML = ''
    resetTotalItemsCount()
   
    sectionTitle.querySelector('#sectionTitle').textContent = selectedSection
   
   
    if(toggleMenu){
        toogle_hamburger_btn()
    }
    
   
    dataDict = {'section':selectedSection,'is_completed':false,'is_visible':true}

    response = await request_handler('main','get_items',dataDict)
    if(response){
        console.log(response)
        
        loadItemsList(response['data'])
    }
    console.log(selectedSection)
}


let selectedId;
let taskIndx;
let selectedElement;
let selectedData;




itemsList.addEventListener('click',(event)=>{
    const clickedItem = event.target.closest('.itemElement')
    if(clickedItem){
    
        const id = clickedItem.dataset.id
        selectedId = parseInt(id)
        for(let trolley in itemsData){
            const match = itemsData[trolley].findIndex(item => item.id === selectedId)
            console.log(match)
            if (match !== -1){
                selectedData = {'trolley':trolley,'index':match,'selectedData':itemsData[trolley][match],'itemQuantity':parseInt(itemsData[trolley][match]['item']['quantity'])}
            }
            }
            selectedElement= clickedItem
            console.log(selectedData,'ttt')
            openItemPage(selectedData['selectedData'])
        }
        
        
    
})




const page = document.getElementById('itemPage')
const closeBtn = document.getElementById('closePageBtn')
const startBtn = document.getElementById('startBtn')
const pauseBtn = document.getElementById('pauseBtn')
const continueBtn = document.getElementById('continueBtn')

const containerStartBtn = startBtn.parentElement
const finishBtn = document.getElementById('finishBtn')

const item_article_number = document.getElementById('item_article_number')
const item_type = document.getElementById('item_type')
const item_condition = document.getElementById('item_condition')
const item_quantity = document.getElementById('item_quantity')
const item_upholstery = document.getElementById('item_upholstery')
const tasksPageContainer = document.getElementById('tasksPageContainer')
const item_notes = document.getElementById('item_notes')

const taskTemplate = document.getElementById('taskListTemplate')


function checkForStartTime(){

    if(selectedData['selectedData']['start_time']){
        
        containerStartBtn.style.display = 'none'
        tasksPageContainer.style.display = 'flex'
        finishBtn.style.display ='flex'

        if(selectedData['selectedData']['is_paused']){
            continueBtn.style.display = 'flex'
            pauseBtn.style.display = 'none'
            finishBtn.style.display = 'none'
        }else{
            continueBtn.style.display = 'none'
            pauseBtn.style.display = 'flex'
            
            
        }
           
    }
    else{
        tasksPageContainer.style.display = 'none'
        containerStartBtn.style.display = 'flex'
        finishBtn.style.display ='none'
        pauseBtn.style.display = 'none'
        continueBtn.style.display = 'none'
    }
}

function openItemPage(data){
    page.style.display = 'flex'
    hamburgerBtn.style.display = 'none'
    console.log(data)
   
    checkForStartTime()
   
    
    item_article_number.textContent =  data['item']['article_number']
    item_type.textContent = data['item']['item_type']
    item_condition.textContent = data['item']['condition']
    item_quantity.textContent = data['item']['quantity']
    item_upholstery.textContent = data['item']['upholstery']
    item_notes.textContent = data['item']['notes']

    tasksPageContainer.innerHTML = ''
    data['tasks'].forEach((task,task_index)=>{
        let clone = taskTemplate.content.cloneNode(true)
        let taskElement =  clone.querySelector("[data-value='item_task']")
        let checkBox = clone.querySelector('input')
        checkBox.setAttribute('id-value',task_index)
        taskElement.textContent = task['task']['task_description']
        tasksPageContainer.appendChild(clone)


        if(task['is_completed']){
            checkBox.checked = true
        }
    })


    check_task_completion()
   
    
}
function check_task_completion(){
    let boxList = tasksPageContainer.querySelectorAll('input')
        
    are_tasks_checked = Array.from(boxList).every(box => box.checked )
    if (are_tasks_checked){
        finishBtn.classList.replace('bg-grey','bg-dark')
        pauseBtn.style.display = 'none'

    }
    else{
        if(finishBtn.classList.contains('bg-dark')){
            finishBtn.classList.replace('bg-dark','bg-grey')
            if(selectedData['selectedData']['start_time'] ){
                if(selectedData['selectedData']['is_paused'] ){
                    pauseBtn.style.display = 'none'
                    continueBtn.style.display = 'flex'
                }else{
                    pauseBtn.style.display = 'flex'
                    continueBtn.style.display = 'none'
                }
               
            }
            
        }
        
    }
}


function closePage(){
    page.style.display = 'none'
    hamburgerBtn.style.display = 'flex'
    
}

let are_tasks_checked;

async function finishBtnAction(){
    let checkBoxList = tasksPageContainer.querySelectorAll('input')

    if (are_tasks_checked){
        let fetchDict = {'type':'set_time','id':selectedData['selectedData']['id'], 'value':'end_time'}
        let response = await handleUserAction(fetchDict)
        if(response){
            if(response['status'] == 'confirmation'){
                const trolley = selectedData['trolley']
                const index = selectedData['index']
                itemsData[trolley].splice(index,1)
                if(itemsData[trolley].length === 0){
                    delete itemsData[trolley]
                }
                selectedElement.remove()

                
                totalItemsCount['itemCountStarted'] -= selectedData['itemQuantity']
                totalItemsCompleted += selectedData['itemQuantity']
                modifiedCounts = ['itemCountStarted']
                updateItemsCompleted(true)

                closePage()
                
            }else{
                console.log(response)
            }
        }
        
        
    }

}




function startBtnAction(){

    selectedData['selectedData']['start_time'] = new Date()

    checkForStartTime()

    check_task_completion()

    add_start_item_list(selectedElement)


    let fetchDict = {'type':'set_time','id':selectedData['selectedData']['id'],'value':'start_time'}

    handleUserAction(fetchDict)   

    totalItemsCount['itemCountStarted'] += selectedData['itemQuantity']
    totalItemsCount['itemCountActive'] -= selectedData['itemQuantity']
    modifiedCounts = ['itemCountStarted','itemCountActive']
    update_count_items()
}

async function pauseBtnAction(pauseType,boolean,continueDisplay,pauseDisplay,item_list_funtion){

    let fetchDict = {'type':'set_time','id':selectedData['selectedData']['id'],'value':pauseType,'pause_reason':pauseReasonDict}
    let response = await handleUserAction(fetchDict)

    if(response['status'] == 'confirmation'){

        selectedData['selectedData']['is_paused'] = boolean
        continueBtn.style.display = continueDisplay
        pauseBtn.style.display = pauseDisplay
        item_list_funtion(selectedElement)

        if(pauseType == 'start_time_pause'){
            finishBtn.style.display = 'none'
        }
        else{
            finishBtn.style.display = 'flex'
        }

        if(boolean){
            closePage()
        }
        
    }else{
        console.log(response)
    }
}

const pausePopup = document.getElementById('pausePopup')
const closePausePopup = document.getElementById('closePausingPopupBtn')
const reasonForPauseSelect = document.getElementById('reasonForPause')
const pauseDueToSectionContainer = document.getElementById('pauseDueToSectionContianer')
const pauseSectionSelect = document.getElementById('pauseSectionSelect')
const pauseSelectContainer = document.getElementById('pauseSelectContainer')
const pauseSubmitBtn = document.getElementById('submitPauseBtn')


let pauseReasonDict = {'reason':''}

function popupPauseReason(){
    
    pausePopup.style.display = 'flex'
    
    const templateExtraOptions = document.getElementById(`templatePause ${selectedSectionLi}`)
    if(templateExtraOptions){
        let optionClone = templateExtraOptions.content.cloneNode(true)
        reasonForPauseSelect.appendChild(optionClone)
    }

    const optionOther = document.createElement('option');
    let otherText = 'other'
    optionOther.value = otherText; 
    optionOther.textContent = otherText;
    optionOther.classList.add('Extra-pause-option')
    reasonForPauseSelect.appendChild(optionOther);
}


reasonForPauseSelect.addEventListener('change',()=>{
    let selectedReason = reasonForPauseSelect.value
    
    pauseReasonDict['reason'] = selectedReason
    
    if(selectedReason == 'waiting for other section'){
        pauseDueToSectionContainer.style.display = 'flex'
        pauseReasonDict['pause_due_to_section'] = ''
    }


})
pauseSectionSelect.addEventListener('change',()=>{
    let selectedDueSection = pauseSectionSelect.value
    
    
    pauseReasonDict['pause_due_to_section'] = selectedDueSection 
    console.log(pauseReasonDict)
  
})

pauseSubmitBtn.addEventListener('click',()=>{
    for (const key in pauseReasonDict){
        if(pauseReasonDict[key] == ''){
            
            setTimeout(()=>{
                fetch_message({'status':'alert','message':'Select an option'})
            },100)
            return
            
        }
    }

    pauseBtnAction('start_time_pause',true,'flex','none',add_pause_item_list)
    totalItemsCount['itemCountPaused'] += selectedData['itemQuantity']
    totalItemsCount['itemCountStarted'] -= selectedData['itemQuantity']
    modifiedCounts = ['itemCountPaused', 'itemCountStarted']
    update_count_items()

    resetPauseOptions()
})


function resetPauseOptions(){
    pausePopup.style.display = 'none'
    pauseReasonDict = {'reason':''}
    pauseSectionSelect.style.display = 'none'
    let optionsToRemove = document.querySelectorAll('.Extra-pause-option')
    optionsToRemove.forEach((option)=>{
    option.remove()
    })
}


pauseBtn.addEventListener('click',()=>{
    
    popupPauseReason()
})
continueBtn.addEventListener('click',()=>{
    pauseBtnAction('end_time_pause',false,'none','flex',remove_pause_item_list)
    totalItemsCount['itemCountPaused'] -= selectedData['itemQuantity']
    totalItemsCount['itemCountStarted'] += selectedData['itemQuantity']
    modifiedCounts = ['itemCountPaused', 'itemCountStarted']
    update_count_items()
})

closePausePopup.addEventListener('click',()=>{
    resetPauseOptions()
})

closeBtn.addEventListener('click',()=>{
    closePage()
})

startBtn.addEventListener('click',(e)=>{
    startBtnAction()
})

finishBtn.addEventListener('click',(e)=>{
    finishBtnAction()
})


tasksPageContainer.addEventListener('click',(e)=>{
    const selectedTask = e.target.closest('input')
    if(selectedTask){
       
        
        taskIndx = parseInt(selectedTask.getAttribute('id-value'))
        
    
        fetchDict = {'type':'task', 
                    'task_id':selectedData['selectedData']['tasks'][taskIndx]['task_id'],
                    'value':selectedTask.checked
        }
        handleUserAction(fetchDict)
    }
})


async function handleUserAction(fetchDict){
    let response = await request_handler('main','userAction',fetchDict)
    if( response ){
        if(fetchDict['type'] == 'task'){
            selectedData['selectedData']['tasks'][taskIndx]['is_completed'] = fetchDict['value']
            check_task_completion()
        }
        else if (fetchDict['value'] == 'end_time' || fetchDict['value'] == 'start_time_pause' || fetchDict['value'] == 'end_time_pause' ){
            
            fetch_message(response)
        }
       
    }
    return response
}

