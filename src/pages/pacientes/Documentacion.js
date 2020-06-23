import React, {useEffect, useState} from 'react'
import styled from 'styled-components'

import {Trash} from '@styled-icons/heroicons-outline/Trash'
import {FileUpload} from '@styled-icons/fa-solid/FileUpload'

import GlassButton from '../../common/GlassButton'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl} from '../../redux'

import {confirmAlert} from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import FileUploader from '../../components/FileUploader'


export default function Documentacion()
{
    console.log('......[Documentacion]')

    const history = useHistory()
    const dispatch = useDispatch()

    const data = useSelector(st => st.fb.attachments)
    const selPatient = useSelector(st => st.fb.selPatient)
    const [selAttachment] = useState(null)

    const [setFileInfo] = useState()

    const removeAttachmentHandle = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar adjunto',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeSessionAttachment(selAttachment.id))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }

    useEffect(() =>
    {
        if (selPatient)
            dispatch(bl.getAttachmentsByPatient(selPatient.id))
        else history.replace('/')
    }, [dispatch, history, selPatient])

    return (
        <Frame>
            <SessionHeader>
                <div>{selPatient.apellido}, {selPatient.nombres}</div>
                <div>Adjuntos:{data.length}</div>
            </SessionHeader>
            <Attachments>
                {data.map((a, i) =>
                    <div>
                        <FileUploader onFileSelected={(data)=>setFileInfo(data)}>
                            <GlassButton height={40}>
                                <IconUpload />
                            </GlassButton>
                        </FileUploader>

                        {/* <GlassButton
                            background={(selSession.url || fileInfo) ? 'green' : 'gray'}
                            onClick={e => viewFactura(e)}>
                            <IconView />
                         </GlassButton> */}
                        <GlassButton height={40} onClick={e => removeAttachmentHandle(e, a)}>
                            <IconDelete />
                        </GlassButton>
                    </div>
                )}

            </Attachments>
        </Frame>
    )
}

const Frame = styled.div`
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
    grid-template-columns: 1fr 60px;
    grid-column-gap: 10px;
    align-items: center;
`
const IconUpload = styled(FileUpload)`
    width: 14px;
    color: white;
    padding-top: 3px;
`
const IconDelete = styled(Trash)`
    width:25px;
    color: white;
`