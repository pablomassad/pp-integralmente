import React, {useEffect} from 'react'
import styled from 'styled-components'

import {Cancel} from '@styled-icons/material-outlined/Cancel'
import {FileUpload} from '@styled-icons/fa-solid/FileUpload'
import generic from '../../assets/images/attachment.jpg'

import GlassButton from '../../common/GlassButton'
import {useDispatch, useSelector} from 'react-redux'
import {bl} from '../../redux'

import {confirmAlert} from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import FileUploader from '../../components/FileUploader'
import moment from 'moment'


export default function Documentacion()
{
    console.log('......[Documentacion]')

    const dispatch = useDispatch()

    const data = useSelector(st => st.fb.attachments)
    const userInfo = useSelector(st => st.fb.userInfo)
    const selPatient = useSelector(st => st.fb.selPatient)

    const removeAttachmentHandle = (e, att) =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar adjunto',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeAttachment(selPatient.id, att.id))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }
    const getExtension = (fn) =>
    {
        const idx = fn.lastIndexOf('.')
        const ext = (idx !== -1) ? fn.substring(idx+1) : ''
        console.log('extension:', ext)
        return ext
    }
    const onFileHandle = async (obj) =>
    {
        const attUrl = await dispatch(bl.uploadFileStorage(selPatient.id, obj.file))
        const attachment = {
            id: new Date().getTime().toString(),
            extension: getExtension(obj.file.name),
            nombre: obj.file.name,
            uid: userInfo.id,
            url: attUrl
        }
        await dispatch(bl.addAttachmentByPatient(selPatient.id, attachment))
    }
    const isImage = (ext) =>
    {
        let flag = ((ext === 'png') || (ext === 'jpg') || (ext === 'jpeg') || (ext === 'gif'))
        return flag
    }
    const downloadHandle = (url) =>
    {
        window.open(url, '_system', 'location=yes')
    }

    useEffect(() =>
    {
        if (selPatient)
            dispatch(bl.getAttachmentsByPatient(selPatient.id))
    }, [dispatch, selPatient])

    return (
        <Frame>
            <SessionHeader>
                <div>{selPatient.apellido}, {selPatient.nombres}</div>
                <div>Adjuntos:{data.length}</div>
            </SessionHeader>
            <Attachments>
                {data.map((a, i) =>
                    <AttachmentFrame key={i}>
                        <GrdAtt>
                            <Picture src={isImage(a.extension) ? a.url : generic} onClick={() => downloadHandle(a.url)}></Picture>
                            <Footer>{a.nombre}</Footer>
                            <Footer>{moment(Number(a.id)).format('YY-MM-DD HH:mm')}</Footer>
                        </GrdAtt>
                        <IconDelete onClick={(e) => removeAttachmentHandle(e, a)} />
                    </AttachmentFrame>
                )}
                <FileUploader onFileSelected={onFileHandle}>
                    <GlassButton
                        fixed
                        right={5}
                        bottom={5}
                        width={50}
                        height={50}
                        radius={50}>
                        <IconUpload />
                    </GlassButton>
                </FileUploader>
            </Attachments >
        </Frame >
    )
}

const Frame = styled.div`
    --id:Frame;
    overflow: auto;
	height: calc(100vh - 135px);
`
const AttachmentFrame = styled.div`
    --id:AttachmentFrame;
    box-shadow:1px 1px 3px black;
    border-radius:10px;
    background:lightgray;
    padding:5px;
    margin:5px;
    width:150px;
    height:190px;
    position:relative;
`
const SessionHeader = styled.div`
	--id:SessionHeader;
	margin: 5px;
	font-size: 19px;
	color: black;
	display: grid;
	grid-template-columns: 1fr 120px;
	align-items: center;
`
const Attachments = styled.div`
    --id: Attachments;
    display: grid;
    grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));
    align-items:center;
    grid-column-gap: 10px;
    align-items: center;
`
const GrdAtt = styled.div`
    --id:GrdAtt;
    display:grid;
    grid-template-rows:1fr 20px 20px;
    justify-items:center;
`
const IconUpload = styled(FileUpload)`
    --id:IconUpload;
    width: 14px;
    color: white;
    padding-top: 3px;
`
const Picture = styled.img`
    --id:Picture;
    width:100%;
    height: 150px;
    border-radius:10px;
    border:1px solid black;
    object-fit: cover;
`
const Footer = styled.div`
    --id:Footer;
    font-size:12px;
`
const IconDelete = styled(Cancel)`
    --id:IconDelete;
    bottom: -1px;
    position: absolute;
    color: black;
    width: 25px;
    right: -1px;
`