const inputDateFrom = document.getElementById('inputDateFrom')
const todayDate = new Date().toISOString().split('T')[0];


inputDateFrom.value = todayDate



function loadDataInPage(data){

    for ( const section in data){
        const sectionElementContainer = document.querySelector(`[id-stats='${section}']`)
        sectionElementContainer.querySelector(`[data-value='completedItems']`).textContent = data[section]['completed_items']
        sectionElementContainer.querySelector(`[data-value='activeItems']`).textContent = data[section]['total_active_items']

        
        let avgMinutes = Math.floor(data[section]['average_time_seconds'] / 60)


        sectionElementContainer.querySelector(`[data-value='avgCompletionTime']`).textContent = avgMinutes
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