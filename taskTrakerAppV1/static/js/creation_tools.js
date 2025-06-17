
// id of header and template for the span that holds the text
const containerHeaders = document.getElementById('QueryHeadersContainer')
const headersSpan = document.getElementById('QueryHeaderSpan')

// --------------------------------------------------------------------


// container for the objects return in query 
const containerQueryResults = document.getElementById('QueryResults')


const creationContainer = document.getElementById('CreationContainer')
const creationContainerTitle = document.getElementById('CreationContainerTitle')
const creationContainerBtn = document.getElementById('CreationContainerBtn')


const editObjContainer = document.getElementById('EditObjContainerFields')
const editObjContainerBtns = document.getElementById('EditObjContainerBtns')
const saveEditObj = document.getElementById('saveEditObjBtn')
const deleteEditObj = document.getElementById('deleteEditObjBtn')
const confirmDeleteEditObjBtn = document.getElementById('confirmDeleteEditObjBtn')
// --------------------------------------------------------------------


// templates for the elements in the fetch data 
const containerObject = document.getElementById('QueryResultsElement')
const displayInfoRow = document.getElementById('objectDisplayInfoRow')

const displayInfoSpan = document.getElementById('objectDisplayInfoSpan')
const TemplatecontainerExtraInfo = document.getElementById('ObjectExtraInfoContainer')

// --------------------------------------------------------------------

// templates for the creation of Users
const templateCreationTitle = document.getElementById('TemplateCreationContainerTitle')

// --------------------------------------------------------------------


let fetchedData;
let dataMap;

let mappingFields = {
                    'Users':
                    {   
                        'headers':['Username','Role'],
                        'display': ['username',{'column':'roles','value':['role_name']}],
                        'extra-info-title':['Assigned Sections'],
                        'extra-info':[{'column':'assign_sections','values':['section_name']}],
                        'creation-title':'Create User'

                    },
                    'Roles':
                    {   
                        'headers':['Role'],
                        'display': ['role_name'],
                        'extra-info-title':['Assigned Users'],
                        'extra-info':[{'column':'users','values':['username']}],
                        'creation-title':'Create User'

                    },
                    'Sections':
                     {   
                        'headers':['Icon','Section name'],
                        'display': ['section_icon','section_name'],
                        'extra-info-title':['Assigned Tasks'],
                        'extra-info':[{'column':'assign_task','values':['task_name']}],

                    },
                    'Tasks':
                     {   
                        'headers':['Taks name'],
                        'display': ['task_name'],
                        'extra-info-title':['Task Description'],
                        'extra-info':[{'column':'task_description'}],
                    },
                    'Pause_Reasons':
                     {   
                        'headers':['Pause description'],
                        'display': ['pause_descriptions'],
                        'extra-info-title':['Assigned Sections'],
                        'extra-info':[{'column':'assign_sections','values':['section_name']}],
                    },
                    'Storage_Unit':
                     {   
                        'headers':['type', 'Abreviation','Number'],
                        'display': ['storage_type','abreviation','storage_number'],
                        'extra-info-title':['Storage capacity'],
                        'extra-info':[{'column':'capacity'}],
                    }

                }

function cloneTemplate(template){
    let clone = template.content.cloneNode(true)
    return clone
}
function cleanPage(){
    containerHeaders.innerHTML = ''
    containerQueryResults.innerHTML = ''
    creationContainer.innerHTML = ''

}

function load_db_data(data, menuValue){

    cleanPage()

     // loads headers ------
    mappingFields[menuValue]['headers'].forEach(headerText =>{
        let clone = cloneTemplate(headersSpan)
        clone.querySelector('span').innerHTML = headerText
        containerHeaders.appendChild(clone)
    })

    fetchedData = data
    
    if(fetchedData){
        // creates map for editing function
        dataMap = new Map(fetchedData.map(obj =>[obj.id, obj]))

        console.log(fetchedData)
    
        
        // loads display info ----
        fetchedData.forEach(object => {
        
            let cloneContainerObject = cloneTemplate(containerObject)
            let containerDisplayInfo = cloneContainerObject.querySelector('.object-display-info')
            let containerExtraInfo = cloneContainerObject.querySelector('.extra-info-container')
            
            const editBtn = cloneContainerObject.querySelector(`.object-edit-btn`)
            if(editBtn){
                let editDataDict = {"loaded_dic_id":object.id,"model_name":menuValue}
                editDataDict = JSON.stringify(editDataDict)
                editBtn.setAttribute('onclick',`openPageBtn(this,'full-page','main-page',true,JSON.parse('${editDataDict}'),organize_edit_obj)`)
            }

            mappingFields[menuValue]['display'].forEach(displayText =>{

                // if display is a list of values comming from a relationship
                if(typeof displayText == 'object' ){
                    let objectList =  object[displayText['column']]
                    
                    let cloneDisplayRow = cloneTemplate(displayInfoRow)
                    let cloneDisplayRowElement = cloneDisplayRow.querySelector('div')
                    objectList.forEach(objDict =>{
                        displayText['value'].forEach(displayText =>{
                                    let cloneDisplay = cloneTemplate (displayInfoSpan)
                                    let spanElement = cloneDisplay.querySelector('span')
                                    spanElement.classList.add('text','tag','text-white')
                                    spanElement.innerHTML = objDict[displayText] 
                                    cloneDisplayRowElement.appendChild(cloneDisplay)
                        })

                    })
                    containerDisplayInfo.appendChild(cloneDisplayRow)
                
                }
                // else display is a single value
                else{
                    let cloneDisplay = cloneTemplate(displayInfoSpan)
                    cloneDisplay.querySelector('span').innerHTML = object[displayText]
                    containerDisplayInfo.appendChild(cloneDisplay)
                }
                
                
            })
            
            // loads extra info for the drop down -----
            cloneContainerObject.querySelector('#extraInfoTitle').textContent = mappingFields[menuValue]['extra-info-title']
            
            mappingFields[menuValue]['extra-info'].forEach(extraInfo =>{

                let objectExtraInfo = object[extraInfo['column']]
                
                if('values' in extraInfo){
                    objectExtraInfo.forEach(objExtraInfo =>{
                        extraInfo['values'].forEach(value =>{
                        
                        let cloneExtraInfo = cloneTemplate(TemplatecontainerExtraInfo)

                        cloneExtraInfo.querySelector('span').innerHTML = objExtraInfo[value]
                        containerExtraInfo.appendChild(cloneExtraInfo)
                        })
                    })
                }
                else{
                    let cloneExtraInfo = cloneTemplate(TemplatecontainerExtraInfo)

                    cloneExtraInfo.querySelector('span').innerHTML = objectExtraInfo
                    containerExtraInfo.appendChild(cloneExtraInfo)
                }
            
            
            })

            // appends all query templates to the elements in the page
            containerQueryResults.appendChild(cloneContainerObject)
        });
    }
   

    // loads the template for creating objects ----
        // let titleClone = cloneTemplate(templateCreationTitle)
        // titleClone.querySelector('span').innerHTML = mappingFields[menuValue]['creation-title']
        let editName = menuValue.replace('_', ' ')
        creationContainerTitle.querySelector('.creation-title').innerHTML = editName
        let creationBtn = creationContainerBtn.querySelector('.btn')
        creationBtn.setAttribute('data-value',menuValue)


        const templateCreationContainer = document.getElementById(`TemplateCreationFormContainer${menuValue}`)
        

        let cloneForm = cloneTemplate(templateCreationContainer)

        
        // appends interaction templates to the elements in the page ---
        
        
        creationContainer.appendChild(cloneForm)

        load_creation_inputs(menuValue)


}

// in values list of list
//  the first value is the value that will be taken from the fetch dict
// the second value is the target element in html, it must have an attribute of target-input= "some number"
// the third value is for occassion where something more must be added, in this case the attribute "value"
// the fourth is the value that will be placed from the fetchdict in the attribute specify above

// input_type targets a template in the html document
// model complements the target template of inputs and tells the backend which model should it extract
let mappingCreationsFileds = {
                                'Users':{
                                    'input_map':[
                                                {'model':'sections','input_type':'customCheckbox','values':[['id',1,'value','id'],['section_icon',2],['section_name',3]]},
                                                {'model':'roles','input_type':'select','values':[['role_name',1,'value','id']]}
                                            ]
                                },
                                'Sections':{
                                    'input_map':[
                                                {'model':'tasks','input_type':'customCheckbox','value_in_relationship':'order_indx','values':[['id',1,'value','id'],['task_name',3]]}
                                                
                                            ]
                                },
                                 'Roles':{
                                    'input_map':[
                                                {'model':'users','input_type':'customCheckbox','values':[['id',1,'value','id'],['username',3]]}
                                                
                                            ]
                                },
                                 'Pause_Reasons':{
                                    'input_map':[
                                                {'model':'sections','input_type':'customCheckbox','values':[['id',1,'value','id'],['section_icon',2],['section_name',3]]}
                                                
                                            ]
                                },
                                
}

async function load_creation_inputs(modelName){

    if (modelName in mappingCreationsFileds){
        let mappModelName = mappingCreationsFileds[modelName]
        let fetchModels = mappModelName['input_map'].map(item => item.model)
        
        let fetchDict = {'model_name':fetchModels, 'query':'all', 'columns_to_unpack':['essentials']}

        let response = await request_handler('get_db_info','databases_info',fetchDict)
        console.log(response)
        if(response['status'] == 'confirmation'){
            
            data = response['data']
            
            console.log('creating container')
            mappModelName['input_map'].forEach(inputMap =>{
                let containerInput = creationContainer.querySelector(`.${inputMap['input_type']}-Container`)
                let templateOption = document.getElementById(`Template${inputMap['input_type']}`)
                let templateValueInRel;
                if('value_in_relationship' in inputMap){
                    templateValueInRel = document.getElementById(`Template${inputMap['input_type']}_${inputMap['value_in_relationship']}`)
                }
                

                let dataDict = data[inputMap['model']]
                dataDict.forEach(fetchObj =>{
                    let cloneTemplate = templateOption.content.cloneNode(true)
                    inputMap['values'].forEach(targetElement =>{
                        let targetInTemplate = cloneTemplate.querySelector(`[target-input="${targetElement[1]}"]`)
                        targetInTemplate.innerHTML = fetchObj[targetElement[0]]
                        if (targetElement.length > 2){
                            if(targetElement[2] == 'value'){
                                targetInTemplate.name = inputMap['model']
                                targetInTemplate.value = fetchObj[targetElement[3]]
                            }
                        }
                    })
                    if(templateValueInRel){
                        let cloneTemplateRel = templateValueInRel.content.cloneNode(true)
                        cloneTemplateRel.querySelector(`[name="${inputMap['value_in_relationship']}"]`).setAttribute('belongs_to',fetchObj[inputMap['values'][0][0]])
                        cloneTemplate.querySelector('.checkBoxRow').appendChild(cloneTemplateRel)
                    }

                    containerInput.appendChild(cloneTemplate)
                })
            })   
        }
    }
    
}

// maps the required fields in the creationTemplate
let mappRequiredField = {
                            'Users':
                            {
                                'requiredInputs':['username','Roles','email','phone','password','sections'],
                                'fields':['username','email','phone','password'],
                                'relationships':[
                                    {'many_to_many':'Users_Roles','target_model':'roles','values':[]},
                                    {'many_to_many':'Users_Sections','target_model':'sections','values':[]}
                                ]
                            },
                            'Sections':
                            {
                                'requiredInputs':['section_name','tasks'],
                                'fields':['section_name'],
                                'relationships':[
                                    {'many_to_many':'Tasks_Sections','target_model':'tasks','values':[],'value_in_relationship':'order_indx'}
                                ]
                            },
                             'Roles':
                            {
                                'requiredInputs':['role_name'],
                                'fields':['role_name'],
                                'relationships':[
                                    {'many_to_many':'Users_Roles','target_model':'users','values':[]}
                                ]
                            },
                             'Tasks':
                            {
                                'requiredInputs':['task_name','task_description'],
                                'fields':['task_name','task_description'],
                                'relationships':[]
                            },
                            'Pause_Reasons':
                            {
                                'requiredInputs':['pause_descriptions','sections'],
                                'fields':['pause_descriptions'],
                                'relationships':[{'many_to_many':'Pauses_Reasons_Sections','target_model':'sections','values':[]}]
                            },
                            'Storage_Unit':
                            {
                                'requiredInputs':['storage_type','storage_number','abreviation','capacity'],
                                'fields':['storage_type','storage_number','abreviation','capacity'],
                                'relationships':[]
                            }
}

// rebuilding logic for create_obj function, edit_obj function will use the same for updating an object
async function create_edit_obj(modelName,inputContainer,targetBackEnd,clickBtn,SkippRequiredInputs=[]){
    let inputs = inputContainer.querySelectorAll('.inputInfo')
    let requierdFields = mappRequiredField[modelName]['requiredInputs']

    let missingFields = []
    let filledFields = []
    let seenRequiredFields = new Set()
    let fetchDict = {'model_name':modelName}
    
 // checks if input is filled if so appends it to filledFields
 // if the input name is in required fields and is not in set then append input name to missingfields
    inputs.forEach(input =>{
        let name = input.getAttribute('name')?.trim()
        let isFilled;
       
        
        if (input.type === 'checkbox'){
            if(!seenRequiredFields.has(name)){
                const checkBoxes = Array.from(document.querySelectorAll(`input[type="checkbox"][name="${name}"]`))
                isFilled = checkBoxes.some(cb => cb.checked)
                seenRequiredFields.add(name)

                if(!SkippRequiredInputs.includes(name)){
                   
                    if(!isFilled && requierdFields.includes(name)){
                        missingFields.push(name)
                    }
                }
                

                if(isFilled){
                    filledFields.push(...checkBoxes.filter(cb => cb.checked))
                }

            }

        }
        
        else{
            
            isFilled = input.value.trim() !== ''
            
            if(isFilled){
                
                filledFields.push(input)
            }
           
            if(!SkippRequiredInputs.includes(name)){
                
                if(requierdFields.includes(name) && !seenRequiredFields.has(name)){
                    seenRequiredFields.add(name)
                    if(!isFilled){
                        missingFields.push(name)
                    }

                }
            }
        }
    })
    
   console.log(filledFields,'dd')
    
    let isValid = missingFields.length === 0;
    // if there is empty fields notifies the user, creates the keys for the userFieldsDict
    if(!isValid){
        fetch_message({'status':'alert','message':`missing ${missingFields[0]}`},clickBtn)
        return
    }


    // collects the input information using the mapprequiredDField as a guide to build the fetch dict 
    let mappingModel = mappRequiredField[modelName]
    if (mappingModel['relationships'].length > 0){
        fetchDict['relationships'] = []
         mappingModel['relationships'].forEach(relationMap =>{
                let target = relationMap['target_model']

                const inputsValues =  filledFields
                                        .filter(input =>{return input.getAttribute('name')?.trim() === target})
                                        .map(input => {
                                            if('value_in_relationship' in relationMap && input.type === 'checkbox'){

                                                value_in_relation = filledFields.find(inputrel =>{return inputrel.getAttribute('belongs_to')?.trim()=== input.value})
                                                console.log(value_in_relation)
                                                return {'value':input.value, 'value_in_relation': value_in_relation.value,'column_in_relation':relationMap['value_in_relationship']}
                                            }
                                            else{
                                                return input.value
                                            }
                                        })
               

                let relationFetchDict = {
                                        'many_to_many':relationMap['many_to_many'],
                                        'target_model':relationMap['target_model'],
                                        'values':inputsValues}

                
                fetchDict['relationships'].push(relationFetchDict)

            })
                 
                
    }
    if (mappingModel['fields'].length > 0){
        fetchDict['fields'] = {}
        
        mappingModel['fields'].forEach(fieldMap =>{
                
            const inputMatch = filledFields.find(input =>input.getAttribute('name')?.trim() === fieldMap)
            
            if(inputMatch){
                fetchDict['fields'][fieldMap] = inputMatch.value
            }
            
        })
    }

    
    // sends data to backend, if something is invalid it doesn't reload page
    fetchDict['actionType'] = targetBackEnd['actionType']

    if(fetchDict['actionType'] == 'edit_obj'){
        fetchDict['item_id'] = targetBackEnd['item_id']
        
    }
    console.log(fetchDict)
    let response = await request_handler(targetBackEnd['blue_print'],targetBackEnd['router'],fetchDict)
    if(response['status'] == 'confirmation'){

        location.reload()
    }
    else{
        fetch_message(response)
    }
}




// validates and creates the dictionary to create a row in specify Model
async function create_obj(e){
    let modelName = e.getAttribute('data-value')
    create_edit_obj(modelName,creationContainer,{'router':'create_obj','blue_print':'create_obj','actionType':'create_obj'},e)
}

// missing to add logic to modify the many to many relationship model, sections should be able to select the order_indx of the task
let EditMapFields = {
        'Users':{
            'header_edit_page':'User',
            'preLoadFields':[{'attribute-value':'username','type':'input'}],
            'postLoadFields':[{'attribute-value':'email','type':'input'},{'attribute-value':'phone','type':'input'}],
            'relationships':[
                {'model_in_dic':'assign_sections','model_in_container':'sections','input_type':'checkbox'},
                {'model_in_dic':'roles','model_in_container':'roles','input_type':'select'}
            
            ]
        },
          'Sections':{
            'header_edit_page':'Section',
            'preLoadFields':[{'attribute-value':'section_name','type':'input'}],
            'postLoadFields':[{'attribute-value':'order_indx','type':'input','belongs_to':'assign_task'}],
            'relationships':[
                {'model_in_dic':'assign_task','model_in_container':'tasks','input_type':'checkbox'},
            
            ]
        },
         'Roles':{
            'header_edit_page':'Role',
            'preLoadFields':[{'attribute-value':'role_name','type':'input'}],
            'relationships':[
                {'model_in_dic':'users','model_in_container':'users','input_type':'checkbox'},
            
            ]
        },
         'Tasks':{
            'header_edit_page':'Task',
            'preLoadFields':[{'attribute-value':'task_name','type':'input'},{'attribute-value':'task_description','type':'input'}],
            'relationships':[]
        },
        'Pause_Reasons':{
            'header_edit_page':'Pause',
            'preLoadFields':[{'attribute-value':'pause_descriptions','type':'input'}],
            'relationships':[{'model_in_dic':'assign_sections','model_in_container':'sections','input_type':'checkbox'}]
        },
         'Storage_Unit':{
            'header_edit_page':'Storage Unit',
            'preLoadFields':[{'attribute-value':'storage_type','type':'input'},{'attribute-value':'abreviation','type':'input'},{'attribute-value':'storage_number','type':'input'},{'attribute-value':'capacity','type':'input'}],
            'relationships':[]
        }
}


// finds the correct input and fill the info with the given information
function fillTargetInput(mapFields, objContianer,objData){
    mapFields.forEach(targetField =>{
        let inputField;
        if('belongs_to' in targetField){
            
            objData = objData[targetField['belongs_to']]

            objData.forEach(objDict =>{
                console.log(objDict, 'in loop')
                let inputField = objContianer.querySelector(`${targetField['type']}[name="${targetField['attribute-value']}"][belongs_to="${objDict['task_id']}"]`)
                inputField.value = objDict['order_indx']
            })
            
        }else{
            let inputField = objContianer.querySelector(`${targetField['type']}[name="${targetField['attribute-value']}"]`)
             inputField.value = objData[targetField['attribute-value']]
        }
            
           
        })
}


// sets the edit page 
async function organize_edit_obj(passArgs,actionDict){
    
    // gets the data already brought to the fron in the map set in the function load_db
    let objData = dataMap.get(passArgs['loaded_dic_id'])
    console.log(objData,'in edit func')

    let targetEditMap = EditMapFields[passArgs['model_name']]

    document.querySelector('.EditTitle').innerHTML = targetEditMap['header_edit_page']

    // edit page same as the creation container in the parent model
    editObjContainer.innerHTML = creationContainer.innerHTML

    // edit object button 
    editObjContainerBtns.setAttribute('data-value',passArgs['model_name'])
    editObjContainerBtns.setAttribute('obj-id',passArgs['loaded_dic_id'])

    // delete object button set to the confirm button
    deleteEditObj.querySelector('span').innerHTML  = `Delete ${targetEditMap['header_edit_page']}`
    confirmDeleteEditObjBtn.setAttribute('data-value',passArgs['model_name'])
    confirmDeleteEditObjBtn.setAttribute('obj-id',passArgs['loaded_dic_id'])
    

    // if the edit map has fields as key
    if('preLoadFields' in targetEditMap ){
        let preLoadFields = targetEditMap['preLoadFields']
        fillTargetInput(preLoadFields,editObjContainer,objData)
    }

    if('relationships' in targetEditMap){
        let relationship = targetEditMap['relationships']
        relationship.forEach(targetRelationship =>{
            objData[targetRelationship['model_in_dic']].forEach(dataRel =>{
                if(targetRelationship['input_type'] == 'checkbox'){
                    let targetCheckbox = editObjContainer.querySelector(`input[name='${targetRelationship['model_in_container']}'][value='${dataRel['id']}']`)
                    targetCheckbox.checked = true
                }
                else if(targetRelationship['input_type'] == 'select'){
                    let targetSelect = editObjContainer.querySelector(`select[name='${targetRelationship['model_in_container']}' `)
                    targetSelect.value = dataRel['id']
                }

            })
            
        })
    }

    

    // ---------------------------


    // gets the info of the object that was not brought to the front for editing
    // missing to add logic if no need to make this call...
    if('postLoadFields' in targetEditMap){
         let fetchDict = {'model_name':passArgs['model_name'],'item_id':passArgs['loaded_dic_id'],'query':'item_by_id','columns_to_unpack':['for_editing']}
        let response = await request_handler('get_db_info','databases_info',fetchDict)
        if(response['status'] == 'confirmation'){
            
            let fetchData = response['data']
            let postLoadFields = targetEditMap['postLoadFields']
            console.log(fetchData,'postLoads----')
            fillTargetInput(postLoadFields,editObjContainer,fetchData)
        }
        else{
            
            console.log(response,'what erroe??')
            fetch_message(response)
        }
    }

    
}

async function edit_obj(e) {
    let targetElement = e.closest('#EditObjContainerBtns')
    let model_name = targetElement.getAttribute('data-value')
    let obj_id = targetElement.getAttribute('obj-id')
    if(model_name && obj_id){
        create_edit_obj(model_name,editObjContainer,{'router':'create_obj','blue_print':'create_obj','actionType':'edit_obj','item_id':obj_id},e,['password'])
 
    }    
}

// missing to add delete logic!

function delete_obj(e){
    e.style.display = 'none'
    confirmDeleteEditObjBtn.style.display = 'flex'
}
async function confirm_deletion(e) {
    let model_name = e.getAttribute('data-value')
    let obj_id = e.getAttribute('obj-id')
    let fetchDict = {'model_name':model_name,'item_id':obj_id,'actionType':'delete_obj'}
    let response = await request_handler('create_obj','create_obj',fetchDict)
    if(response['status'] == 'confirmation'){
        location.reload()
    }
    else{
        fetch_message(response)
    }
}








