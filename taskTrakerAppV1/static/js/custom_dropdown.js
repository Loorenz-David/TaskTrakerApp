const queryResults = document.getElementById('QueryContainer')

queryResults.addEventListener('click',(e)=>{
    if(e.target.closest('.arrow')){
        let arrow = e.target.closest('.arrow')
        let queryItemElement = arrow.closest('.query-item-element')
       
        
        arrow.classList.toggle('open')
        queryItemElement.querySelector('.drop-info').classList.toggle('open-info')
    }
})

