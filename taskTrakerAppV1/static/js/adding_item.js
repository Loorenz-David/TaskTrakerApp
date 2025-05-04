const itemInputs = document.querySelectorAll("[data-value]")
const itemSections = document.querySelectorAll('[data-value-checkbox]')

const addItemBtn = document.getElementById('addItemDbBtn')
const itemCounter = document.getElementById('itemCounter')
let itemsCount = 0
addItemBtn.addEventListener('click',async (e)=>{
    let isItemValid = true

    

    let itemDict = {'selected_sections':[], 'item':{}}

    itemInputs.forEach((input)=>{

        if(!input.value){
            input.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
            input.placeholder = 'Missing'
            isItemValid = false
            return
        }
        
        itemDict['item'][input.getAttribute('data-value')] = input.value
    })

    itemSections.forEach((selection)=>{
        if(selection.checked){
            itemDict['selected_sections'].push(selection.getAttribute('data-value-checkbox'))
        }
        
    })

    if(isItemValid){
        
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
        }

        
    }

})
