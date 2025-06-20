const itemInputs = document.querySelectorAll("[data-value]")
const itemSections = document.querySelectorAll('[data-value-checkbox]')
const item_came_back = document.getElementById('item_came_back')
const selectSectionContainer = document.getElementById('selectSectionContainer')
const addItemBtn = document.getElementById('addItemDbBtn')
const itemCounter = document.getElementById('itemCounter')
let itemsCount = 0

function clean_adding_item(){
    let articleNumberInput = document.querySelector('[data-value="article_number"]')
    let conditionSelect = document.querySelector('[data-value="condition"]')
    let quantityInput = document.querySelector('[data-value="quantity"]')
    let upholsteryInput = document.querySelector('[data-value="upholstery"]')
    let dueDateInput = document.querySelector('[data-value="due_date"]')
    let notesInput = document.querySelector('[data-value="notes"]')

    imageContainerSlider.innerHTML = ''
    articleNumberInput.value = ''
    conditionSelect.value = ''
    quantityInput.value = ''
    upholsteryInput.value = ''
    dueDateInput.value = ''
    notesInput.value = ''
    imgUrl = []
    showActionContainer()


}
addItemBtn.addEventListener('click',async (e)=>{
    let isItemValid = true

    let required_inputs = ['storage_number','item_class','item_type','article_number','condition','quantity']
    let missing_fields = []
    let itemDict = {'selected_sections':[], 'item':{}}

    itemDict['item']['item_came_back'] = item_came_back.checked

    itemInputs.forEach((input)=>{
        let isValid = true
        let attrName = input.getAttribute('data-value')
        

        isValid = input.value.trim() !== '';
        
        if(required_inputs.includes(attrName)){
            
            if(!isValid){
                let noDash =  attrName.replace('_',' ')
                missing_fields.push(noDash)
                return
            }
        }
        if(isValid){
            itemDict['item'][attrName] = input.value
        }  
    })

    if(missing_fields.length > 0){
        fetch_message({'status':'alert','message':`missing to fill ${missing_fields[0]}`},addItemBtn)
        return 
    }

    itemSections.forEach((selection)=>{
        if(selection.checked){
            itemDict['selected_sections'].push(selection.getAttribute('data-value-checkbox'))
        }
        
    })

    if(imgUrl.length > 0){
        itemDict['item']['images_url'] = imgUrl
    }

        
    let response = await request_handler('main','adding_item',itemDict)
    if(response){
        const itemInputsArray = Array.from(itemInputs)
        fetch_message(response)
        if(response.status == 'confirmation'){
            let quantityInput = itemInputsArray.find(el => el.getAttribute('data-value') == 'quantity')
            itemsCount += Number(quantityInput.value)
            itemCounter.textContent = itemsCount
            
            clean_adding_item()
            document.querySelector('main').scrollTo({top:0,behavior:'smooth'})
            
        }
        else{
            console.log(response['error_message'])
        }
    }

        

})



selectSectionContainer.addEventListener('click',(e)=>{
    
    let clickOn = e.target
    let targetContainer = clickOn.closest('.custom-checkbox-svg')
    
    if(clickOn && selectSectionContainer.contains(targetContainer)){
        let targetCheckBox = targetContainer.querySelector('input[type="checkbox"]')
        if(targetCheckBox.checked){
        targetCheckBox.checked = false
        }else{
        targetCheckBox.checked = true
        }

        customCheckboxSvg(targetContainer,targetCheckBox.checked)
    }
})

