const inputPrinterIp = document.getElementById('printer-ip')
const printBtn = document.getElementById('printBtn')
const connectToPrinterBtn = document.getElementById('connectToPrinterBtn')


let selectedPrinter = null;

function displayConnection(){
    if(connectToPrinterBtn.classList.contains('hide')){
        connectToPrinterBtn.classList.remove('hide')
    }
    if(!printBtn.classList.contains('hide')){
        printBtn.classList.add('hide')
    }
    
}
function displayPrintBtn(){
    if(!connectToPrinterBtn.classList.contains('hide')){
        connectToPrinterBtn.classList.add('hide')
    }
    if(printBtn.classList.contains('hide')){
        printBtn.classList.remove('hide')
    }
    
}

function printJob(printer,zpl) {
    return new Promise((resolve, reject) => {
       
        printer.send(
            zpl,
            () => {
                console.log(printer)
                // Print was sent successfully
                resolve(true);
            },
            (error) => {
                // This catches the "Broken pipe" and other connection errors
                console.error("Printer error:", error);
                resolve(false)
            }
        );
    });
}


function setUpPrinter(){
    return new Promise((resolve, reject) =>{
        if(typeof BrowserPrint == 'undefined'){
            alert('no browserprint code')
            return resolve(false)
        }

        BrowserPrint.getDefaultDevice("printer", async function(printer) {
            if (printer) {

                if(!printer.uid){
                    fetch_message({'status':'alert','message':'connected to app but no printer added.'})
                    resolve(false)
                }else{
                    const zpl =  "^XA^PW400^LL240^FO0,80^FB400,1,0,C^A0N,40,40^FDReady to print!^FS^XZ";
                    let connected = await printJob(printer, zpl)
                    if(connected) {
                        selectedPrinter = printer
                        fetch_message({'status':'confirmation','message':'Printer connected!'})
                        
                        resolve(true)
                    }
                    else{
                        displayConnection()
                        fetch_message({'status':'alert','message':'no printer found, check connection.'})
                        
                        resolve(false)
                        console.log(err)
                        
                    }   
                }

               
                
            } else {
                fetch_message({'status':'alert','message':'no printer found, check connection.'})
                resolve(false)
                
            }
        }, function (error) {
            console.error("Error getting printer:", error);
            resolve(false)
        });
    })  
}





connectToPrinterBtn.addEventListener('click',(e)=>{
    setUpPrinter().then((connected) =>{
        if(connected){
            displayPrintBtn()
        }
        else{
            displayConnection()
        }
    })
    
})





