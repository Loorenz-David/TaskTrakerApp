
// const bgPopup = document.getElementById('bgPopup')
const checkAll = document.getElementById('selectAllRestartSections')
const checkRestartSection = document.querySelectorAll('[restart-section-id]')
const RestartItemBtn = document.getElementById('RestartItemBtn')

let restart_section_list = []
function openPopup(target){

    let bgPopup = document.querySelector(`.${target}`)
   
    bgPopup.style.display= 'flex'
    
    
}
function closePopup(target){
    let bgPopup = document.querySelector(`.${target}`)
    
    bgPopup.style.display= 'none'
    
   
    
}

checkAll.addEventListener('change',(e)=>{
    if(checkAll.checked == true){
        checkRestartSection.forEach(ck =>{
            ck.checked = true
        })
    }
    else{
        checkRestartSection.forEach(ck =>{
            ck.checked = false
        })
    }
})

RestartItemBtn.addEventListener('click',(e)=>{
    
    let checkedBoxes = bgPopup.querySelectorAll('input[restart-section-id]:checked')
    
    if(RestartItemBtn.getAttribute('action-btn') == 'create_value_list'){
        restart_section_list = []
        let temp_list = []
        checkedBoxes.forEach(ck =>{
            let section_id = ck.getAttribute('restart-section-id') 
            
            temp_list.push(Number(section_id))
        })
        restart_section_list = temp_list
    }

    closePopup('restartPopup')

    
})