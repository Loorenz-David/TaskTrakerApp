

function change_counter_value(id,itemQuantity){
    let count = 0
    
    if(id in itemCounts){
        count = itemCounts[id]
        itemCounts[id] += itemQuantity
    }
    else{
        itemCounts[id] = itemQuantity
    }


    count += itemQuantity




    let targetElement = document.querySelector(`[data-display="${id}"]`)
    targetElement.innerHTML = count
}