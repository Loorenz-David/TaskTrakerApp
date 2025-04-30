const itemInputs = document.querySelectorAll("[data-value]")
const itemSections = document.querySelectorAll('[data-value-checkbox]')

const addItemBtn = document.getElementById('addItemDbBtn')

addItemBtn.addEventListener('click',async (e)=>{
    let isItemValid = true
    console.log(11)

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
        
        let response = await request_handler('main','adding_item',itemDict)
        console.log(response)
        if(response['message'] == 'Item added'){
           
            window.location.herf = '/add_item'
        }
        else{
            alert('something went wrong')
        }
    }

})
