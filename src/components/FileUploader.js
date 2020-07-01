import React, {useRef} from 'react'

export default function FileUploader({children, onFileSelected, photo})
{
    const inputFile = useRef()

    const chooseFile = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        inputFile.current.click()
    }
    const onChangeFile = origFile =>
    {
        if (photo) {
            var reader = new FileReader();
            reader.onload = async (e) =>
            {
                const preData = e.target.result
                console.log('size Image before:', getImageSize(preData))
                generateFromImage(preData, 300, 300, 1, postData =>
                {
                    console.log('size Image after:', getImageSize(postData))
                    onFileSelected(origFile, postData)
                })
            }
            reader.readAsDataURL(origFile)
        }
        else
            onFileSelected(origFile)
        inputFile.current.id = new Date().getTime() // force re-render
    }
    const generateFromImage = (img, MAX_WIDTH = 700, MAX_HEIGHT = 700, quality = .8, callback) =>
    {
        var canvas = document.createElement("canvas");
        var image = new Image()

        image.onerror = (err) =>
        {
            console.log('Error', err)
        }
        image.onload = () =>
        {
            var width = image.width;
            var height = image.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, width, height);

            // IMPORTANT: 'jpeg' NOT 'jpg'
            var dataUrl = canvas.toDataURL('image/jpeg', quality);

            callback(dataUrl)
        }
        image.src = img;
    }
    const getImageSize = (data) =>
    {
        var head = 'data:image/jpeg;base64'
        var size = data.length - head.length * 3 / 4 / (1024 * 1024).toFixed(4)
        return size
    }

    return (
        <>
            {/* <input type="file" ref={inputFile} style={{display: 'none'}} onChange={onChangePic} accept="image/gif, image/jpeg, image/jpg, image/png" /> */}
            <input type="file" ref={inputFile} style={{display: 'none'}} onChange={(e) => onChangeFile(e.target.files[0])} />
            <div onClick={chooseFile}>
                {children}
            </div>
        </>
    )

}