const loginBtn = document.getElementById('loginBtn')

loginBtn.addEventListener('click',async()=>{
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    if(!username){

    }
    else if(!password){

    }
    else{
        let response = await  request_handler('main','login',{'username':username,'password':password})
        if(response['status'] == '200'){
            window.location.href = '/'
        }
    }
})
