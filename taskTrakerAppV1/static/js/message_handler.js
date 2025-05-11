const fetchMessageContainer = document.getElementById('fetchMessageBox')
const fetchMessageElement = document.getElementById('fetch-message-text')

function fetch_message(dataDict,extra_param=undefined){

    
    
    let fetchSvg = fetchMessageContainer.querySelector(`[svg-id="${dataDict['status']}Svg"]`)

    fetchMessageContainer.style.display = 'inline-block'
    fetchMessageElement.textContent = dataDict['message']
    fetchSvg.style.display = 'inline-block'
    
    setTimeout(()=>{
        
        fetchMessageContainer.classList.add('slide-down')
    },100)

    
    fetchClickHandler = (e) => {
        if (!fetchMessageContainer.contains(e.target)){
            hideFetchMessage(fetchSvg)
        }
    }

    window.addEventListener('click',fetchClickHandler)
   
    setTimeout(()=>{
        hideFetchMessage(fetchSvg)
        
    },3000)

}

function hideFetchMessage (fetchSvg){
    fetchMessageContainer.classList.remove('slide-down')
    
    setTimeout(()=>{
        fetchMessageContainer.style.display = 'none'
       
        fetchSvg.style.display = 'none'
    },200)

    if(fetchClickHandler){
        window.removeEventListener('click',fetchClickHandler);
        fetchClickHandler = null
    }
    
}




