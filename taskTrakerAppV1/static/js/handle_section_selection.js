
let sectionList = ulSections.querySelectorAll('li')
let itemsList = document.getElementById('containerItemsList')
let itemsData;


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
            }
            trollyList.appendChild(itemClone)
        })
        itemsList.appendChild(trollyClone)
    })
}

// make this to work when user selects start in itme
function add_start_item_list(element){
    let hasStartedElement = document.createElement('div')
    let spanStarted = document.createElement('span')
    hasStartedElement.classList.add('has-started')
    spanStarted.textContent = 'Started'
    hasStartedElement.appendChild(spanStarted)
    element.appendChild(hasStartedElement)
}

function loadItemsList(dataList,query=false){
   
   
    sortedByTrolleys = dataList.reduce((acc,item)=>{
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

    console.log(sortedByTrolleys)
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

sectionList.forEach((section)=>{
    section.addEventListener('click',(e)=>{
        
        let selection = e.currentTarget.querySelector('span').textContent
        console.log(selection)
        setPageForSelection(selection)
    })
})

async function setPageForSelection(selectedSection,toggleMenu=true){
    itemsList.innerHTML = ''

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
                selectedData = {'trolley':trolley,'index':match,'selectedData':itemsData[trolley][match]}
            }
            }
            selectedElement= clickedItem
            console.log(selectedData,'ttt')
            openItemPage(selectedData['selectedData'])
        }
        
        
    
})




const page = document.querySelector('.full-page')
const closeBtn = document.getElementById('closePageBtn')
const startBtn = document.getElementById('startBtn')
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
    }
    else{
        tasksPageContainer.style.display = 'none'
        containerStartBtn.style.display = 'flex'
        finishBtn.style.display ='none'
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
    }
    else{
        if(finishBtn.classList.contains('bg-dark')){
            finishBtn.classList.replace('bg-dark','bg-grey')
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

    
    
}

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
        else if (fetchDict['value'] == 'end_time'){
            console.log('enddd')
            fetch_message(response)
        }
    }
    return response
}

