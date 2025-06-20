const fetchMessageContainer = document.getElementById('fetchMessageBox')
const fetchMessageElement = document.getElementById('fetch-message-text')

let FetchMessagetimeOutId ;
function fetch_message(dataDict,btn=undefined,extra_param=undefined,){

    if (dataDict['status'] == 'error'){
        if('error_message' in dataDict){
             console.log(dataDict['error'])
        }
       
    }
    
    let fetchSvg = fetchMessageContainer.querySelector(`[svg-id="${dataDict['status']}Svg"]`)

    if (fetchMessageContainer.style.display === 'inline-block'){
        console.log('showing')
        let activeSvg = fetchMessageContainer.querySelector('svg:not([style*="display:none"]')
        hideFetchMessage(activeSvg)

        setTimeout(() => {
            showFetchMessage(fetchSvg,dataDict,btn)
        }, 200);
    }

    else{
        
        showFetchMessage(fetchSvg,dataDict,btn)
    }

    FetchMessagetimeOutId = setTimeout(() => {
        if (fetchMessageContainer.style.display == 'inline-block'){
            hideFetchMessage(fetchSvg)
        }
    }, 3000);
    
    

}
function showFetchMessage(fetchSvg,dataDict,btn){
    fetchMessageContainer.style.display = 'inline-block'
    fetchMessageElement.textContent = dataDict['message']
    fetchSvg.style.display = 'inline-block'

    void fetchMessageContainer.offsetHeight;

    fetchMessageContainer.classList.add('slide-down')

    

     fetchClickHandler = (e) => {
        
        if (!fetchMessageContainer.contains(e.target)  ){
            
            if(btn){
                if(btn.contains(e.target)){
                    return
                }
            }
            hideFetchMessage(fetchSvg)
        }
    }

    window.addEventListener('click',fetchClickHandler)
   
}

function hideFetchMessage (fetchSvg){
    
    clearTimeout(FetchMessagetimeOutId)
    fetchMessageContainer.classList.remove('slide-down')
    
    setTimeout(()=>{
        fetchMessageContainer.style.display = 'none'
       
        if(fetchSvg){
            fetchSvg.style.display = 'none'
        }
        
    },200)

    if(fetchClickHandler){
        window.removeEventListener('click',fetchClickHandler);
        fetchClickHandler = null
    }
    
}




