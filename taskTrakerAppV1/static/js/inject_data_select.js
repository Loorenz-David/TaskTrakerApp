function injectDataToSelect(targetContainer,elementSelected,map,buildValueFormat=null){
        targetContainer.innerHTML = ''

        let value = elementSelected.value 
        let mapList = map[value]
        mapList.forEach((instance)=>{

            
            let option = document.createElement('option')
            option.setAttribute('value',instance)
            option.innerHTML = instance
            targetContainer.appendChild(option)
        })
    }