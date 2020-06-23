import React, {useRef} from 'react'

export default function FileUploader({children, onFileSelected})
{
    const inputFile = useRef()

    const chooseFile = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        inputFile.current.click()
    }
    const onChangeFile = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        var bigFile = e.target.files[0]
        var reader = new FileReader();
        reader.onload = async (e) =>
        {
            const data = e.target.result
            onFileSelected(data)
        }
        reader.readAsDataURL(bigFile)
        inputFile.current.id = new Date().getTime()
    }

    return (
        <>
            {/* <input type="file" ref={inputFile} style={{display: 'none'}} onChange={onChangePic} accept="image/gif, image/jpeg, image/jpg, image/png" /> */}
            <input type="file" ref={inputFile} style={{display: 'none'}} onChange={onChangeFile} />
            <div onClick={chooseFile}>
                {children}
            </div>
        </>
    )

}