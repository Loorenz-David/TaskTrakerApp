const selectHeader = document.getElementById('selectHeader');
const dropdown = document.getElementById('dropdown');
const selectedOption = document.getElementById('selectedOption');
const arrow = document.getElementById('arrow');
const blurBackground = document.getElementById('blurBackground')



function get_selected_section_id(){
    let selectedId =  selectedOption.querySelector('[data-value]')
    selectedId = selectedId.getAttribute('data-value')
    
    return selectedId
}


selectHeader.addEventListener('click', () => {
    dropdown.classList.toggle('open');
    arrow.classList.toggle('open');
    blurBackground.classList.toggle('hide')
});

dropdown.addEventListener('click', (e) => {
    if (e.target.closest('.dropdown-option')) {
    const option = e.target.closest('.dropdown-option');
    selectedOption.innerHTML = option.innerHTML;

    dropdown.classList.remove('open');
    arrow.classList.remove('open');
    blurBackground.classList.toggle('hide')
    
    if(customSelectWorkingSections){
        let selectedId = get_selected_section_id()
        clearStatusContainer()
        inputQuerySearch.value = ''
        inputQueryData = []
        itemCounts = {}
        
        const fetchDictFirstLoad = {
                                'page':'working_sections',
                                'query_type':'assign_sections',
                                'selected_section': selectedId,
                                'assignment_state':['not','Completed','In-Storage'],
                                'unpack_type':'essentials',
                                'sort':'by_storage',
                                'get_counts':'state'}
                
        query_assignments(fetchDictFirstLoad)
    }

    }
});

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (!document.getElementById('customSelect').contains(e.target)) {
    dropdown.classList.remove('open');
    arrow.classList.remove('open');
     blurBackground.classList.add('hide')
    }
});