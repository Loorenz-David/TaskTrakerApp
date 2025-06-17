
const hamburgerBtn = document.querySelector('.hamburger-btn')
const menuPage = document.querySelector('.menu-page')

function toogle_hamburger_btn(){
   
   
    const hamburgareBtn = document.querySelector('.hamburger-btn')
    menuPage.classList.toggle('active')
    hamburgareBtn.classList.toggle('active-action')
}

function hide_toggle_hamburger_btn(){
    hamburgerBtn.style.display = 'none'
}
function show_toggle_hamburger_btn(){
    hamburgerBtn.style.display = 'flex'
}

if(hamburgerBtn){
    hamburgerBtn.addEventListener('click',toogle_hamburger_btn )
}


