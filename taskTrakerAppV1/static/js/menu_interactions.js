
const hamburgerBtn = document.querySelector('.hamburger-btn')
const menuPage = document.querySelector('.menu-page')

function toogle_hamburger_btn(){
   
   
    const hamburgareBtn = document.querySelector('.hamburger-btn')
    menuPage.classList.toggle('active')
    hamburgareBtn.classList.toggle('active-action')
}

if(hamburgerBtn){
    hamburgerBtn.addEventListener('click',toogle_hamburger_btn )
}


