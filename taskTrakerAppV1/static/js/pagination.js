const previousPage = document.getElementById('previousPage')
const currentPageElement = document.getElementById('currentPage')
const totalPageCountElement = document.getElementById('totalPageCount')
const nextPage = document.getElementById('nextPage')
const paginationContainer = document.getElementById('paginationContainer')


let currentPageCount = 1
let totalPageCount = 3
let btnHid = previousPage
let perPage = 100
let paginationExists = true

ops = {
    'nextPage':(a) => a + 1,
    'previousPage':(a) => a - 1
}

function handlePageCountFunc(element){
    let attName = element.getAttribute('id')
    let result = ops[attName](currentPageCount)

    if(btnHid){
        btnHid.classList.remove('hide')
        btnHid = false
    }

    if(result == totalPageCount || result == 1){
        element.classList.add('hide')
        btnHid = element
    }
    currentPageCount = result

    return true

}

function updateValues(element,value){
    element.textContent = value
}

async function handlePageFetchFunc(element){

    let changePageCount = handlePageCountFunc(element)
     console.log(currentPageCount)
    if(!changePageCount){
        return
    }
    
    updateValues(currentPageElement,currentPageCount)

    let fetchDictFirstLoad ={'page':currentPageCount,'per_page':perPage,'query_type':'pagination','unpack_type':'essentials','sort':'by_storage','get_counts':'state'}
        
    if(Object.keys(queryFiltersDict['for_query']).length > 0 ){
        fetchDictFirstLoad['user_filters'] = queryFiltersDict['for_query']
    }
    first_load_query(fetchDictFirstLoad,true)

    
    
    
   


}






