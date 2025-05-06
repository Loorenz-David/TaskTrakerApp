const responseHandlers ={
    'fetch_message':fetch_message,
}

async function request_handler(bp,functionTarget,dataDict,actionDict=undefined) {
    
    return fetch(`/${bp}/jsserving/${functionTarget}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(dataDict)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if(actionDict){
            for(const key in actionDict){
                if(typeof responseHandlers[key] === 'function'){
                    responseHandlers[key](data,actionDict[key])
                }
            }
        }
        return data
    }

    )
}
