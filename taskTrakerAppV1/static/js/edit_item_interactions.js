const pageForEditItem = document.getElementById('pageForEditItem')

const spanItemInfo = document.querySelectorAll('span[data-tag="itemInfo"]')

const checkInputsChanges = document.querySelectorAll('.collect-input-data')

const editInputs = document.querySelectorAll('input[data-value]')

const selectItemState = document.getElementById('changeItemState')
const selectItemStorageType = document.getElementById('storageType')
const selectItemStorageId= document.getElementById('storageId')
const selectItemCondition = document.getElementById('itemCondition')
const selectItemPorpuse= document.getElementById('itemPorpuse')

const containerForAssignSections = document.getElementById('containerForAssignSections')
const sectionsCheckBoxes = containerForAssignSections.querySelectorAll('input')

const imgContainer = document.getElementById('ImageObjContainer')
const imgSlider = document.getElementById('imageSlider')
const TemplateImgForSlider = document.getElementById('TemplateImgForSlider')
const takeOrUploadImg = document.getElementById('takeOrUploadPicture')


const btnSaveItem = document.getElementById('btnSaveItem')
const btnDeleteItem = document.getElementById('btnDeleteItem')
const btnConfirmDeletion = document.getElementById('btnConfirmDeletion')



let modifyData = {'simple_inputs':{},'item_id':''}
let itemSectionstemp;
// clears some containers from previous loads 
function clearEditPage(){
    
    modifyData = {'simple_inputs':{},'item_id':''}

    //cleares images from slider
    let matches = imgSlider.querySelectorAll('.imageFlexContainer')
    if(matches){
        matches.forEach(img =>{
            img.remove()
        })
    }

    sectionsCheckBoxes.forEach(ck =>{ck.checked=false})
    deletedPicture = false
    uploadedPicture = false
    imgUrl = []
}

async function load_selected_item(itemData,itemId,section=undefined){
    hide_toggle_hamburger_btn()
    clearEditPage()

    // sets up connection to printer
    setUpPrinter().then((connected) =>{
        if(connected){
            displayPrintBtn()
        }
        else{
            displayConnection()
        }
    })
    // ---------------------------------

    console.log(itemData)

    pageForEditItem.style.display = 'flex'
    btnSaveItem.setAttribute('item-id',itemData['id'])
    btnConfirmDeletion.setAttribute('item-id',itemData['id'])
    itemSectionstemp = itemData['assign_sections']
    
    // fixing logic to place the info coming from the itemData dict into inputs
    
    const inputsArray = Array.from(editInputs)
    
    // loads info on simple inputs
    Object.keys(itemData).forEach(key =>{
        let targetInput = inputsArray.find(input => input.getAttribute('data-value') == key)
        if(targetInput){
            
            targetInput.value = itemData[key]
           
        }
    })
    selectItemPorpuse.value = itemData['porpuse']
    selectItemState.value = itemData['state']
    
    
    // fix logic to load images 
    console.log(itemData['images_url'])
    if(itemData['images_url'] && itemData['images_url'].length > 0){
        removeActionContainer()
        itemData['images_url'].forEach(url =>{
            let cloneTemplateImg = TemplateImgForSlider.content.cloneNode(true)
            cloneTemplateImg.querySelector('img').src = url
            let removeBtn = cloneTemplateImg.querySelector('.removeImgBtn')
            removeBtn.setAttribute('data-id',itemData['id'])
            imageContainerSlider.append(cloneTemplateImg)
        })
    }else{ 
        
        showActionContainer()
        
    }
    


    // logic for storage selection, loads the storage type and the id to the two select containers
    const dataStorageType = Object.entries(storageMap)
                            .filter(([key,values]) => values.includes(itemData['storage_number']))
                            .reduce((acc, [key,values]) =>{
                                acc[key] = values;
                                selectItemStorageType.value = key
                                
                                injectDataToSelect(selectItemStorageId,selectItemStorageType,storageMap)
                                return acc
                            },{})
    if (dataStorageType){
        selectItemStorageId.value = itemData['storage_number']
    }

    // logic to assign the selected sections
    const checkBoxList = Array.from(sectionsCheckBoxes)
    
    itemData['assign_sections'].forEach(section =>{
        let targetId = section.section_id
        
        
        let targetCheckBox = checkBoxList.filter((checkBox) => checkBox.getAttribute('data-value-checkbox') == String(targetId))
        
        if(targetCheckBox.length > 0){
            
            let parent = targetCheckBox[0].closest('.custom-checkbox-svg')
            
            targetCheckBox[0].checked = true
            customCheckboxSvg(parent,true)
           

        }
    })


    


    // fetches the info missing for the item selected
    let fetchPost = {'query_type':'single_item','unpack_type':'for_editing','item_id':itemId}
    let response = await request_handler('main','get_items',fetchPost)
    if(response['status'] == 'confirmation'){
        
        let postData =response['data'][0]
        itemData = {...postData,...itemData}
        
        // loads the static info of the item
        spanItemInfo.forEach(span =>{
            let targetKey = span.getAttribute('data-value')
            let targetData = itemData[targetKey]
            if(targetData){
                let date = new Date(targetData)
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const dd = String(date.getDate()).padStart(2, '0');
                targetData = `${yyyy}-${mm}-${dd}`
            }
            else{
                targetData = '--'
            }

            span.innerHTML = targetData
        })
       
        // fix logic for the editable data in inputs after postFetch
        Object.keys(postData).forEach(targetKey =>{
            let targetInput = document.querySelector(`input[data-value="${targetKey}"]`)
            if(targetInput){
                targetInput.value = postData[targetKey]
            }
        })
        selectItemCondition.value = postData['condition']

    }

}

checkInputsChanges.forEach(input =>{

    if(input.classList.contains('section-checkbox') ){
        input.addEventListener('change',(e)=>{

            let sectionId = input.getAttribute('data-value-checkbox')
            let value = input.checked
            let relatedId;

            let modifyDataKey = `modify_assign_section_${sectionId}`
            if(itemSectionstemp.length > 0){
                 relatedId = itemSectionstemp.find(section_dict => section_dict.section_id === Number(sectionId))
            }
         
            modify_section = {'section_id':sectionId,'value':value}
            if(relatedId){
                if(value == false){
                     modify_section['related_id'] = relatedId['id']
                }
                else{
                   delete modifyData[modifyDataKey]
                   return
                }
                
            }
            else{
                if(value == false){
                    delete modifyData[modifyDataKey]
                    return
                }
            }

            modifyData[modifyDataKey] = modify_section
           
        })
    }
    else{
            let keyName = input.getAttribute('data-value')
            
            if(keyName == 'state'){
                input.addEventListener('change',(e)=>{
                modifyData[keyName] = input.value
                })
            }
            else{
                
                input.addEventListener('change',(e)=>{
                    modifyData['simple_inputs'][keyName] = input.value
                   
                })
                
            }
            
    }
  
})


btnSaveItem.addEventListener('click',async  (e)=>{
    let itemId = btnSaveItem.getAttribute('item-id')
    // modifyData is missing to record images changes
    

    if('state' in modifyData && modifyData['state'] == 'Restart'){
        if(restart_section_list.length == 0){
            fetch_message({'status':'alert','message':'To restart, select at least one section'},btnSaveItem)
        }
        else{
            modifyData['section_list'] = restart_section_list

        }
    }
    
    if(deletedPicture || uploadedPicture){
        modifyData['simple_inputs']['images_url'] = imgUrl
    }
    
    
    
    

   

    if(Object.keys(modifyData).length > 2 || Object.keys(modifyData['simple_inputs']).length > 0){
        modifyData['item_id'] = itemId

         if('storage_type' in modifyData['simple_inputs'] &&  !('storage_number' in modifyData['simple_inputs'])){
            let storageNumber = document.querySelector('[data-value = "storage_number"]')
           
            modifyData['simple_inputs']['storage_number'] = storageNumber.value

        }


        let response = await request_handler('main','edit_item',modifyData)
       
        if(response['status'] == 'confirmation'){
            console.log(modifyData,response)
            location.reload()
        }
        else{
            fetch_message(response)
        }
    }
    else{
        fetch_message({'status':'alert','message':'No changes where recorded!'},btnSaveItem)
    }
    


})

btnDeleteItem.addEventListener('click',(e)=>{
    btnConfirmDeletion.style.display = 'flex'
    btnDeleteItem.style.display = 'none'
})

btnConfirmDeletion.addEventListener('click',async (e)=>{

    let itemId = btnConfirmDeletion.getAttribute('item-id')
    btnConfirmDeletion.style.display = 'none'
    btnDeleteItem.style.display = 'flex'
    let fetchDict = {'delete':Number(itemId)}
    let response = await request_handler('main','edit_item',fetchDict)
    if(response['status'] == 'confirmation'){
        location.reload()



    }
    else{
        fetch_message(response)
    }
})

selectItemStorageType.addEventListener('change',(e)=>{
     injectDataToSelect(selectItemStorageId,selectItemStorageType,storageMap)
})


selectItemState.addEventListener('change',(e)=>{
    if(selectItemState.value == 'Restart'){
        openPopup('restartPopup')
    }
})

containerForAssignSections.addEventListener('click',(e)=>{
    
    let clickOn = e.target
    let targetContainer = clickOn.closest('.custom-checkbox-svg')
    
    if(clickOn && containerForAssignSections.contains(targetContainer)){
        let targetCheckBox = targetContainer.querySelector('input[type="checkbox"]')
        if(targetCheckBox.checked){
        targetCheckBox.checked = false
        }else{
        targetCheckBox.checked = true
        }
        targetCheckBox.dispatchEvent(new Event('change'))
        
        customCheckboxSvg(targetContainer,targetCheckBox.checked)
    }
})


if(storageMap){
     injectDataToSelect(selectItemStorageId,selectItemStorageType,storageMap)
}