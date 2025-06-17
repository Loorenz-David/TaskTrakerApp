
const tabs = document.querySelectorAll(".tab");
const topMenuContainer = document.getElementById('topMenu') 

async function topMenuSelection(menuValue){
   
    fetchDict = {'model_name': menuValue, 'query':'all', 'columns_to_unpack':['essentials']}
    let response = await request_handler('get_db_info','databases_info',fetchDict)
    if (response){
      fetch_message(response)
      
      load_db_data(response['data'],menuValue)
    }
}

function removeActiveClass(){
   tabs.forEach(t => t.classList.remove("active"));
}

tabs.forEach(tab => {
  tab.addEventListener("click", async () => {
    removeActiveClass()
    tab.classList.add("active");
    let menuValue = tab.getAttribute('menu-value')
    localStorage.setItem('creationToolsTab',menuValue)
    topMenuSelection(menuValue)


  });
});



function load_last_opened(){
  let openTabStorage = localStorage.getItem('creationToolsTab')

  if(openTabStorage){
    removeActiveClass()
    document.querySelector(`[menu-value="${openTabStorage}"]`).classList.add('active')
    topMenuSelection(openTabStorage)
  }
  else{
    topMenuSelection('Users')
  }
}

load_last_opened()
