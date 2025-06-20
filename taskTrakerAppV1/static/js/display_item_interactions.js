let pageForDisplayitem = document.getElementById('pageForDisplayItem')
let imgSlider = document.getElementById('imageSlider')
let noImageContainer = document.getElementById('noImageContainer')
let TemplateImgForSlider = document.getElementById('TemplateImgForSlider')
let taskObjContainer = document.getElementById('TaskObjContainer')
let TemplateForTask = document.getElementById('TemplateForTaskContainer')
let btntaskIncompleted = document.getElementById('btnTaskIncompleted')
let reasonForTaskIncompleted = document.getElementById('reasonForTaskIncompleted')
const btnInteractions = document.getElementById('btn-interactions')
const btnStart = document.getElementById('btnStart')
const btnFinish =document.getElementById('btnFinish')
const btnContinue =document.getElementById('btnContinue')

const btnPause =document.getElementById('btnPause')
const pauseReasonsUniversal = document.getElementById('pauseReasonsUniversal')
const selectContainerPauseReasons = document.getElementById('pauseReasons')
const confirmPauseBtn = document.getElementById('confirmPauseBtn')

const sendItemBackBtn = document.getElementById('sendItemBackBtn')

const restartPopup = document.querySelector('.restartPopup')
const RestartItemBtn = document.getElementById('RestartItemBtn')


let selectedItem;
let currentItemState;




function clearPage(){

    // clears images from slider
    let matches = imgSlider.querySelectorAll('.imageFlexContainer')
    if(matches){
        matches.forEach(img =>{
            img.remove()
        })
    }

    if(noImageContainer.classList.contains('hide')){
        noImageContainer.classList.remove('hide')
       
    }

    taskObjContainer.innerHTML = ''


}



async function load_selected_item(itemData,itemId,section=undefined){
    selectedItem = itemId
    hide_toggle_hamburger_btn()
    clearPage()

   
    pageForDisplayitem.style.display = 'flex'
    

    if(itemData.images_url && itemData.images_url.length > 0){
        
        noImageContainer.classList.add('hide')

         itemData['images_url'].forEach(url =>{
            
            let cloneTemplateImg = TemplateImgForSlider.content.cloneNode(true)
            cloneTemplateImg.querySelector('img').src = url
            imgSlider.append(cloneTemplateImg)
        })
    }

    Object.keys(itemData).forEach(key =>{
        let targetSpan = document.querySelector(`[data-tag="itemInfo"][data-value="${key}"]`)
        if(targetSpan){
            targetSpan.innerHTML = itemData[key]
        }
        if(key == 'due_date'){
           markDueDate(itemData[key],targetSpan)
        }
    })


    

    

    
    


    // loads the second set of info
    let postFetchDict = {
                        'page':'working_sections',
                        'query_type':'single',
                        'selected_assignment': itemId,
                        'section_id':itemData['section_id'],
                        'unpack_type':'for_display'}
    let response = await request_handler('main','get_items',postFetchDict)
    if(response['status'] == 'confirmation'){
        console.log(response['data'])
        let postLoadData = response['data'][0]
        Object.keys(postLoadData).forEach(key =>{
            
            if(key== 'assign_task'){
                loadTasks(postLoadData[key])
                return
            }

            let targetSpan = document.querySelector(`[data-tag="itemInfo"][data-value="${key}"]`)
            
            if(targetSpan){
                targetSpan.innerHTML = postLoadData[key]
            }

        })

        currentItemState = itemData['state']
        
        let taskChildren = taskObjContainer.children
       
        let areTaskCompleted = check_task_completion()
        hideAllBtnInteractions()
        if(areTaskCompleted){
            if(itemData['state'] !== 'Restart'){
                 btnFinish.classList.remove('hide')
            }
            
           
        }
        else{
            
            if(itemData['state'] == 'Active'){
                btnStart.classList.remove('hide')
                taskObjContainer.classList.add('hide')
            }else{
                
                if(taskObjContainer.classList.contains('hide')){
                    taskObjContainer.classList.remove('hide')
                }

                if(itemData['state'] == 'Working'){
                btnPause.classList.remove('hide')
                }
                else if( itemData['state'] == 'Paused'){
                    
                    btnContinue.classList.remove('hide')
                }
               
            }  
        }
        if(itemData['state'] == 'Restart'){
                
                btnContinue.classList.remove('hide')
                // find way to deselect the last assign task in the list
                
                
                if(taskChildren.length > 0){
                    let selectLastTask = taskChildren[taskChildren.length - 1]
                    let targetCheckBox = selectLastTask.querySelector('input[type="checkbox"]')
                    let targetTaskName = selectLastTask.querySelector('[task-value="task_name"]')

                    targetCheckBox.checked = false
                    if(targetTaskName.classList.contains('text-incompleted')){
                        targetTaskName.classList.remove('text-incompleted')
                        targetTaskName.classList.add('text-dark-grey')
                    }
                }
            }
    }
    
    // load pause Reasons

}

function hideAllBtnInteractions(){
    let btnsChildren = btnInteractions.children
        for(btn of btnsChildren){
            if(!(btn.classList.contains('hide'))){
                btn.classList.add('hide')
            }
        }
}

function loadTasks(taskList){
    taskList.sort((a,b)=> a.task_order - b.task_order)
    taskList.forEach(taskDict=>{
        let cloneTaskTemplate = TemplateForTask.content.cloneNode(true)
        let checkBox = cloneTaskTemplate.querySelector('[data-value="checkBoxTask"]')
            
       

        let taskIdContainer = cloneTaskTemplate.querySelector('.taskCheckContainer')
        taskIdContainer.setAttribute('task-checkmark',taskDict['task_assign_id'])

        let taskName = cloneTaskTemplate.querySelector(`span[task-value="task_name"]`)
        let taskDescription = cloneTaskTemplate.querySelector(`span[task-value="task_description"]`)
        taskName.innerHTML = taskDict['task_name']
        taskDescription.innerHTML = taskDict['task_description']

        let incompleteBtn = cloneTaskTemplate.querySelector('.incompleteBtn')
        incompleteBtn.setAttribute('onclick',`setIncompletedTaskContainer(${taskDict['task_assign_id']})`)
        
        if(taskDict['state'] == 'Completed' ){
           
            checkBox.checked  = true
        }
        else if( taskDict['state'] == 'Incompleted'){
            taskName.classList.remove('text-dark-grey')
            taskName.classList.add('text-incompleted')
        }

        taskObjContainer.appendChild(cloneTaskTemplate)
    })
}

taskObjContainer.addEventListener('click', function(e){
    let targetTask = e.target.closest('.arrowTask')
    let targetCheckBox = e.target.closest('.checkBoxTask')

    if(targetCheckBox && this.contains(targetCheckBox)){
        let parent = targetCheckBox.closest('.taskCheckContainer')
        let assignTaskId = parent.getAttribute('task-checkmark')
        let taskState;
        let taskName = parent.querySelector("[task-value = 'task_name']")
        if(targetCheckBox.checked){
            taskState = 'Completed'
            if(taskName.classList.contains('text-incompleted')){
                taskName.classList.remove('text-incompleted')
                taskName.classList.add('text-dark-grey')
            }
        }
        else{
            taskState = 'Active'
        }
        let taskFetchDict = {'type':'task','assign_task_id':Number(assignTaskId),'value':taskState}
        let response = request_handler('main','userAction',taskFetchDict)
        
    }

    if(targetTask && this.contains(targetTask)){
        let parent = targetTask.closest('.taskCheckContainer')
        let extraInfoContainer = parent.querySelector('[task-action="taskExtraInfoContainer"]')
        extraInfoContainer.classList.toggle('hide')
        targetTask.classList.toggle('open')
    }

    let areTaskCompleted = check_task_completion()
    hideAllBtnInteractions()
    if(areTaskCompleted){
        
        btnFinish.classList.remove('hide')

    }
    else{
        
        if(currentItemState == 'Working'){
            btnPause.classList.remove('hide')
        }
        else if(currentItemState == 'Paused' || currentItemState == 'Restart'){
            btnContinue.classList.remove('hide')
        }
       
    }

   
})

function setIncompletedTaskContainer(task_assign_id){
    reasonForTaskIncompleted.value = ''
    openPopup('taskPopup')
    
    btntaskIncompleted.setAttribute('task-id',task_assign_id)
}

btntaskIncompleted.addEventListener('click',(e)=>{
    task_assign_id = btntaskIncompleted.getAttribute('task-id')
    let taskFetchDict = {
        'type':'task',
        'assign_task_id':task_assign_id,
        'value':'Incompleted',
        'incompleted_notes':reasonForTaskIncompleted.value
    }
    let response = request_handler('main','userAction',taskFetchDict)
    
    let parentCheckBox = document.querySelector(`[task-checkmark = "${task_assign_id}"]`)
    let targetCheckbox = parentCheckBox.querySelector("input[type='checkbox']")
    let targetName = parentCheckBox.querySelector("[task-value = 'task_name']")

    targetName.classList.add('text-incompleted')
    targetName.classList.remove('text-dark-grey')
    targetCheckbox.checked = false
    closePopup('taskPopup')

    let areTaskCompleted = check_task_completion()
    if(areTaskCompleted){
        hideAllBtnInteractions()
        btnFinish.classList.remove('hide')

    }
    else{
        hideAllBtnInteractions()
        if(currentItemState == 'Working'){
            btnPause.classList.remove('hide')
        }
        else if(currentItemState == 'Paused'){
            btnContinue.classList.remove('hide')
        }
    }
})

function change_item_status_live(itemId,section_name,status){
    let itemContiner = document.querySelector(`[data-value = "itemContainer"][data-id="${itemId}"]`)
    let targetIconContiener = itemContiner.querySelector(`svg[id-value="${section_name}"]`).parentElement
    
    const classes = Array.from(targetIconContiener.classList)
    for(const cls of classes){
        if(cls.includes('status-')){
            targetIconContiener.classList.remove(cls)
            break
        }
    }
    if(targetIconContiener.classList.contains('twinkle')){
        targetIconContiener.classList.remove('twinkle')
    }

    targetIconContiener.classList.add(`status-${status}`)

    if(status == 'Working'){
        targetIconContiener.classList.add('twinkle')
    }

}   

function check_task_completion(){
    const checkBoxes = taskObjContainer.querySelectorAll('input[type="checkbox"]')
    let isValid = true
    for(ck  of checkBoxes){
        if(ck.checked == false){
            let parent = ck.closest('.taskCheckContainer')
            let taskName = parent.querySelector('[task-value="task_name"]')
            if(taskName.classList.contains('text-incompleted')){
                continue
            }
            else{
                isValid = false
            }
        }
    }

    
    return isValid
}

btnStart.addEventListener('click', async(e)=>{
    let fetchItemAction = {'value':'start_time',
                            'id':selectedItem,
                            'type':'set_time'
                            }
    
    let response = await request_handler('main','userAction',fetchItemAction)
    if(response){
        
        fetch_message(response)
        if(response['status'] == 'confirmation'){
            change_item_status_live(selectedItem,response['section_name'],'Working')
            btnStart.classList.add('hide')
            btnPause.classList.remove('hide')

            
            taskObjContainer.classList.remove('hide')
            let targetDict = dataMap.get(Number(selectedItem))
            targetDict['state'] = 'Working'
            
            let itemQuantity = Number(targetDict['quantity'])
            let negativeCount = -Math.abs(itemQuantity)

            change_counter_value('Working',itemQuantity)
            change_counter_value('Active',negativeCount)

            currentItemState = 'Working'

        }
        
    }
})

btnPause.addEventListener('click',(e)=>{
    
    let cloneOptions = pauseReasonsUniversal.content.cloneNode(true)
    selectContainerPauseReasons.innerHTML = ''
    selectContainerPauseReasons.appendChild(cloneOptions)

   
    openPopup('pausePopup')
})

confirmPauseBtn.addEventListener('click',async(e)=>{

    let reason = selectContainerPauseReasons.value
    let selectedOption = selectContainerPauseReasons.options[selectContainerPauseReasons.selectedIndex]
    let isWorRelated = selectedOption.getAttribute('work-related')
    let workRelatedValue;
    if(isWorRelated == 'yes'){
        workRelatedValue = true
    }
    else{
        workRelatedValue = false
    }
   
    let fetchDictPauseReason = {'id':selectedItem,
                                'value':'start_time_pause',
                                'pause_reason':reason,
                                'is_work_related':workRelatedValue,
                                'type':'set_time',
                                }
    
    
    let response = await request_handler('main','userAction',fetchDictPauseReason)
    if(response){
        
        fetch_message(response)
        if(response['status'] == 'confirmation'){
            
            closePopup('pausePopup')
            change_item_status_live(selectedItem,response['section_name'],'Paused')
            btnPause.classList.add('hide')
            btnContinue.classList.remove('hide')
            

            let targetDict = dataMap.get(Number(selectedItem))
            targetDict['state'] = 'Paused'

            let itemQuantity = Number(targetDict['quantity'])
            let negativeCount = -Math.abs(itemQuantity)

            change_counter_value('Paused',itemQuantity)
            change_counter_value('Working',negativeCount)

            currentItemState = 'Paused'

        }
    }       

})

btnContinue.addEventListener('click',async(e)=>{
    fetchDictContinueAfterPause = {'id':selectedItem,
                                    'value':'end_time_pause',
                                    'type':'set_time'
    }
    let response = await request_handler('main','userAction',fetchDictContinueAfterPause)
    if(response){
        fetch_message(response)
        if(response['status'] == 'confirmation'){
            btnPause.classList.remove('hide')
            btnContinue.classList.add('hide')
            
            change_item_status_live(selectedItem,response['section_name'],'Working')

            let targetDict = dataMap.get(Number(selectedItem))
            targetDict['state'] = 'Working'
            

            let itemQuantity = Number(targetDict['quantity'])
            let negativeCount = -Math.abs(itemQuantity)

            change_counter_value('Working',itemQuantity)
           
            change_counter_value(currentItemState,negativeCount)
            
            currentItemState = 'Working'
            
            
        }
    }
})

btnFinish.addEventListener('click',async (e)=>{
    fetchDictFinish = {'id':selectedItem,
                        'type':'set_time',
                        'value':'end_time'
                        }
    let response = await request_handler('main','userAction',fetchDictFinish)
    if(response){
        fetch_message(response)
        if(response['status'] == 'confirmation'){
            

            let targetDict = dataMap.get(Number(selectedItem))
            
            let itemQuantity = Number(targetDict['quantity'])
            let negativeCount = -Math.abs(itemQuantity)
            change_counter_value('Completed',itemQuantity)
            
            change_counter_value(currentItemState,negativeCount)

            openPageBtn(undefined,'main-page','pageForDisplayItem',false)

            dataMap.delete(Number(selectedItem))
            let targetContainer = queryResultsContainer.querySelector(`[data-value="itemContainer"][data-id="${selectedItem}"]`)
            targetContainer.classList.add('fade-slide-out')
            setTimeout(()=>{
                targetContainer.remove()
            },400)

            
            
        }
    }
})

RestartItemBtn.addEventListener('click', async (e)=>{

    let targetData = dataMap.get(Number(selectedItem))
    let targetItemId = targetData['item_id']

    let listOfSelectedSections = []
    let checkBoxes = restartPopup.querySelectorAll('input[type="checkbox"][restart-section-id]')
    checkBoxes.forEach(ck =>{
        if(ck.checked){
            let value = ck.getAttribute('restart-section-id')
            listOfSelectedSections.push(Number(value))
        }
    })

    let fetchRestartItem = {
                            'section_list':listOfSelectedSections,
                            'state':'Restart',
                            'item_id': targetItemId,
                            'restarting_from':'working sections'
    }
    
    let response = await request_handler('main','edit_item',fetchRestartItem)
    if(response){
       
        if('not_change_sections' in response){
           fetch_message({'status':'alert','message':`section ${response['not_change_sections'][0]} already has item`},RestartItemBtn)
        }else{
            fetch_message(response,RestartItemBtn)
        }
        
        if(response['status'] == 'confirmation'){
            closePopup('restartPopup')

        }
    }
    
})






// missing the logic for sending message to person in charge to show task is missing something

// missing the logic for allowing to see the completed items with in one week



