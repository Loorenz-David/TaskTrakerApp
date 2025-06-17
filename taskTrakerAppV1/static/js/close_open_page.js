
// 
function closePageBtn(e,pageContainer=undefined){
    let pageToClose;
    if(pageContainer){
       pageToClose = document.querySelector(`.${pageContainer}`)
        
    }

    pageToClose.style.display = 'none'
    

}



function openPageBtn(e,openPage,closepageBehind=undefined,hideHamburgerBtn=false,editDict=undefined,function_target=undefined,actionDict=undefined){
    const pageContainer = document.querySelector(`.${openPage}`)
    pageContainer.style.display = 'flex'



    if(closepageBehind){
        const closePageContainer = document.querySelector(`.${closepageBehind}`)
        closePageBtn(undefined,closepageBehind)
    }


    if(hideHamburgerBtn){
        hamburgerBtn.style.display= 'none'
    }
    else{
        hamburgerBtn.style.display = 'flex'
    }
    

    if(function_target){
        function_target(editDict,actionDict)
    }
}