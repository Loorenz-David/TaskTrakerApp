
async function printLabel(articleNumber,storage_unit,labelQuantity){
    if(!selectedPrinter){
        fetch_message({'status':'alert','message':'no connection to printer'},printBtn)
        displayConnection()
    }

    const zpl = `
                ^XA
                ^POI  
                ^PW400
                ^LL240

                ^FO0,30^A0N,35,35^FB400,1,0,C^FD ${storage_unit}^FS

                ^FO0,90^A0N,45,45^FB400,1,0,C^FD${articleNumber}^FS
                ^PQ${labelQuantity}
                ^XZ
                `;
    let printing = await printJob(selectedPrinter,zpl)
    if(printing){
        console.log(printing)
        console.log('printing!')
    }
    else{
        displayConnection()
        fetch_message({'status':'alert','message':'no printer found, check connection.'})
                
    }

    // selectedPrinter.send(zpl, function(){
    //     console.log('label send to printer')
    // },function(error){
    //     console.log(error)
    // })  
}

printBtn.addEventListener('click',(e)=>{
    const storageUnit = document.querySelector('[data-value="storage_number"]')
    const articleNumberInput = document.querySelector('[data-value="article_number"]')
    const quantityInput = document.querySelector('[data-value="quantity"]')
    let labelQuantity = 1
    if (!articleNumberInput.value ){
        fetch_message({'status':'alert','message':'missing article number'},printBtn)
        return
    }
    if(!storageUnit.value){
        fetch_message({'status':'alert','message':'missing storage unit'},printBtn)
        return
    }
    if(quantityInput.value){
        labelQuantity = quantityInput.value
    }
    

    printLabel(articleNumberInput.value,storageUnit.value, labelQuantity)
})