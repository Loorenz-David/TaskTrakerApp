function openPopup(target){

    let bgPopup = document.querySelector(`.${target}`)
   
    bgPopup.style.display= 'flex'
    
    
}
function closePopup(target){
    let bgPopup = document.querySelector(`.${target}`)
    
    bgPopup.style.display= 'none'
    
   
    
}