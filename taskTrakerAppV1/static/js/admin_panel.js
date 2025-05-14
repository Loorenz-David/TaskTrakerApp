const inputDateFrom = document.getElementById('inputDateFrom')
const todayDate = new Date().toISOString().split('T')[0];


inputDateFrom.value = todayDate



function loadDataInPage(data){

    for ( const section in data){
       
        const sectionElementContainer = document.querySelector(`[id-stats='${section}']`)

           
            sectionElementContainer.querySelector(`[data-value='completedItems']`).textContent = data[section]['completed_items']
            sectionElementContainer.querySelector(`[data-value='activeItems']`).textContent = data[section]['total_active_items']

            

            if(section == 'general_stats'){
                let avgHourRaw = data[section]['average_raw_item_seconds'] * 3600
                let avgHourReal = data[section]['average_real_item_seconds'] * 3600
                
                sectionElementContainer.querySelector(`[data-value='averageRawItemPerHour']`).textContent = avgHourRaw.toFixed(3)
                sectionElementContainer.querySelector(`[data-value='averageRealItemPerHour']`).textContent = avgHourReal.toFixed(3)
            }
            else{
                let rawTime = Math.floor(data[section]['raw_time'] / 60)
                let realTime = Math.floor(data[section]['real_time'] / 60)
                let pauseTimeWork = Math.floor(data[section]['pause_time_work'] / 60)

                sectionElementContainer.querySelector(`[data-value='avgRawTime']`).textContent = rawTime
                sectionElementContainer.querySelector(`[data-value='avgRealTime']`).textContent = realTime
                sectionElementContainer.querySelector(`[data-value='avgPauseWork']`).textContent = pauseTimeWork


            }
           
        
    }


}

async function getSectionStats(){


    let fetchDict = {'date_from':inputDateFrom.value,
                    'sections': ['Dismantler','Cleaner','Upholstery Remover','Foam Installer','Upholstery Installer','Wood Frame Fixer','Remontering','Photography']
    }
    let response = await request_handler('main','get_stats',fetchDict)
    if(response){
        console.log(response)
        fetch_message(response)
        if(response['status'] == 'confirmation'){
            loadDataInPage(response['data'])
        }
    }

}

inputDateFrom.addEventListener('change',getSectionStats)

getSectionStats()