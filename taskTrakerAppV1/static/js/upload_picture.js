
const takePictureInput =  document.getElementById('UploadInput')
const UploadPictureInput = document.getElementById('cameraInput')
const templateImgContainer = document.getElementById('TemplateImgForSlider')
const imageSlider = document.getElementById('imageSlider')
const imageContainerSlider = document.getElementById('imageContainerSlider')
const takeOrUploadPicture = document.getElementById('takeOrUploadPicture')
let allowFileList = ['image/jpeg','image/png','image/webp','image/heic']

let uploadedPicture = false;
let imgUrl = []
let deletedPicture = false

function removeActionContainer(){
    takeOrUploadPicture.classList.add('hide') 
    imageContainerSlider.classList.remove('hide')
}
function showActionContainer(){
    imageContainerSlider.classList.add('hide')
    takeOrUploadPicture.classList.remove('hide') 
}

function add_remove_spinner(input){
    let parent = input.parentElement
        
    let span = parent.querySelector('span')
    let spinner = parent.querySelector('.spinner-20')

    if (spinner.style.display == 'flex'){
        span.style.display = 'flex'
        spinner.style.display = 'none'
    }else{
        span.style.display = 'none'
        spinner.style.display = 'flex'
    }
}

async function process_image(file,input){
        
        let imgContainer = templateImgContainer.content.cloneNode(true)

        const reader = new FileReader()
        const img = new Image()

        reader.onload = function (){
             img.src = reader.result
        };

        img.onload = () =>{


            const minLength = Math.min(img.width, img.height);
            const sx = (img.width - minLength) / 2;
            const sy = (img.height - minLength) / 2;

            const canvas = document.createElement('canvas')
            canvas.width = minLength
            canvas.height = minLength

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img,sx,sy,minLength, minLength, 0, 0, minLength, minLength)

            canvas.toBlob( async(blob) =>{
                
            
                // fix logic to send picture to back end
                uploadedPicture = true
                const formData = new FormData()
                formData.append('image',blob,'image.webp')
              
                let response = fetch('/main/jsserving/upload_picture',{
                    method:'POST',
                    body:formData
                })
                .then(response => response.json())
                .then( response => {
                    if (response ['status'] == 'confirmation'){
                        add_remove_spinner(input)
                        fetch_message(response)
                        let preview = imgContainer.querySelector('img')
                        preview.src = response['picture_url']
                        imgUrl.push(response['picture_url'])
                        imageContainerSlider.appendChild(imgContainer)
                        removeActionContainer()
                       
                    }
                    else{
                        fetch_message(response)
                    }
                })

                


            }, 'image/webp', 0.2)

        }


        reader.readAsDataURL(file)
        

}

function uploadPicture(input){
    const file = input.files[0]
    let inputAction = input.getAttribute('action-type')


    if(file){
        
        if(!allowFileList.includes(file.type)){
            fetch_message({'status':'alert','message':'file is not supported'},input)
            return
        }
        add_remove_spinner(input)
       

        if (file.type === "image/heic" || file.name.endsWith(".heic")) {
            heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.2
            }).then(convertedBlob => {
                process_image(convertedBlob, input);
            }).catch(error => {
                fetch_message({'status':'alert','message':'Failed to convert HEIC'}, input);
                add_remove_spinner(input)
               
            });
        } else {
            process_image(file, input);
        }

       

        
    }
}
async function removeUploadedPicture(btn){
    let parent = btn.parentElement
    let imgContainer = parent.querySelector('img')
    let url = imgContainer.src
    let spinner = parent.querySelector('.spinner-20')
    let closeBars = parent.querySelector('.closeBarContainer')

    if(!url){
        fetch_message({'status':'alert','message':'no url in container'})
    }

    spinner.style.display = 'flex'
    closeBars.style.display = 'none'

    let fetchDict = {'url_file':url,'folder':'pictures_task_tracker_app/'}

    if(btn.getAttribute('btn-action') && btn.getAttribute('btn-action') == 'editItem'){
        fetchDict['edit_item'] = btn.getAttribute('data-id')
    }
    
    let response = await request_handler('main','delete_picture',fetchDict)
    if(response['status'] == 'confirmation'){
        fetch_message(response)
        parent.remove()
       
        if(imageContainerSlider.children.length == 0){
            showActionContainer()
            
        }
        let findUrlInList = imgUrl.findIndex(item => item === url)
        if(findUrlInList !== -1){
            imgUrl.splice(findUrlInList,1)
        }
        
        deletedPicture = true
    }

    spinner.style.display = 'none'
    closeBars.style.display = 'flex'
}


takePictureInput.addEventListener('change',(e)=>{
    uploadPicture(e.currentTarget)
})

UploadPictureInput.addEventListener('change',(e)=>{
    uploadPicture(e.currentTarget)
})