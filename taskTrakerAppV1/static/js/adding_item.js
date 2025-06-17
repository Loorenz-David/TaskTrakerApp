const itemInputs = document.querySelectorAll("[data-value]")
const itemSections = document.querySelectorAll('[data-value-checkbox]')
const item_came_back = document.getElementById('item_came_back')

const addItemBtn = document.getElementById('addItemDbBtn')
const itemCounter = document.getElementById('itemCounter')
let itemsCount = 0
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

        
    let response = await request_handler('main','adding_item',itemDict,{'fetch_message':undefined})
    if(response){
        const itemInputsArray = Array.from(itemInputs)

        if(response.status == 'confirmation'){
            let quantityInput = itemInputsArray.find(el => el.getAttribute('data-value') == 'quantity')
            itemsCount += parseInt(quantityInput.value)
            itemCounter.textContent = itemsCount
            quantityInput.value = ''
            itemInputsArray.find(el => el.getAttribute('data-value') == 'upholstery').value = ''
            
        }
        else{
            fetch_message(response)
        }
    }

        

})
