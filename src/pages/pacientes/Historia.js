import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'

import {BackInTime} from '@styled-icons/entypo/BackInTime'
import {FileUpload} from '@styled-icons/fa-solid/FileUpload'
import {File} from '@styled-icons/boxicons-regular/File'
import {Trash} from '@styled-icons/heroicons-outline/Trash'
import {AttachOutline} from '@styled-icons/evaicons-outline/AttachOutline'

import GlassButton from '../../common/GlassButton'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector, shallowEqual} from 'react-redux'
import {bl, ui} from '../../redux'

import moment from 'moment'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {registerLocale, setDefaultLocale} from 'react-datepicker'
import es from 'date-fns/locale/es'

import {confirmAlert} from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css


export default function Historia()
{
    console.log('......[Historia]')
    const history = useHistory()
    const dispatch = useDispatch()

    const sessions = useSelector(st => st.fb.sessions, shallowEqual)
    const selPatient = useSelector(st => st.fb.selPatient, shallowEqual)

    const [fileInfo, setFileInfo] = useState()
    const inputFile = useRef()
    const sessionList = useRef()

    const [criteria, setCriteria] = useState('')
    const [selSession, setSelSession] = useState(null)

    const data = sessions
        .filter((s) => criteria.length < 3 || Object.keys(s).some((k) => `${s[k]}`.toLowerCase().includes(criteria.toLowerCase())))
        .map((s) => selSession?.id === s.id ? selSession : s);

    const dataAndNew = (selSession?.id === 0 ? [selSession] : []).concat(data)

    const removeSesion = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar Sesion',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeSesion({id: selSession.id}))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }
    // const viewFactura = e =>
    // {
    //     e.stopPropagation()
    //     e.preventDefault()

    //     if (selFactura.url) {
    //         window.open(selFactura.url, '_system', 'location=yes')
    //     }
    //     if (fileInfo) {
    //         // console.log('view PDF')
    //         // fetch(f.url)
    //         // 	.then(response => {
    //         // 		response.blob().then(blob => {
    //         let url = window.URL.createObjectURL(fileInfo)
    //         let a = document.createElement('a')
    //         a.href = url
    //         a.download = fileInfo.name
    //         a.click()
    //         //window.location.href = response.url;
    //     }
    // }
    const onSelSession = (e, s) =>
    {
        e.preventDefault()
        if (selSession?.dirty) return // Factura en edicion

        const newSesion = {...s}
        console.log('onSelSession', newSesion)
        setSelSession(newSesion)
    }
    const updateselSession = (field, value) =>
    {
        const newSesion = {...selSession, [field]: value, dirty: true}
        setSelSession(newSesion)
    }
    const addSesionHandle = () =>
    {
        const newSesion = {id: 0, dirty: true}
        setSelSession(newSesion)
        sessionList.current.scrollTo(0, 0) //sessionList.current.scrollHeight+1000)
    }
    const cancelChanges = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        setSelSession(null)
    }
    const acceptChanges = async () =>
    {
        if (fileInfo) {
            if (selSession.nombre) {
                //    await dispatch(bl.deleteFileStorage('facturas', selFactura.nombre))
                console.log('nombre existente: ', selSession.nombre)
            }

            const url = await dispatch(bl.uploadFileStorage('sesiones', fileInfo))
            selSession.url = url
            selSession.nombre = fileInfo.name
        }
        console.log('updated Sesion: ', selSession)
        const res = await dispatch(bl.updateSesion(selSession))
        if (res) {
            dispatch(ui.showMessage({msg: 'Sesión guardada', type: 'success'}))
            setFileInfo(undefined)
            setSelSession(null)
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar la sesión', type: 'error'}))
        }
    }
    const chooseAttachment = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        inputFile.current.click()
    }
    const onAttachment = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        console.log('file: ', e.target.files[0])
        setFileInfo(e.target.files[0])
    }

    useEffect(() =>
    {
        if (selPatient)
            dispatch(bl.getSessionsByPatient(selPatient.id))
        else history.replace('/')
    }, [])

    return (
        <SessionsFrame>
            <input type="file" ref={inputFile} style={{display: 'none'}} onChange={onAttachment} />
            <SessionHeader>
                <div>{selPatient.apellido}, {selPatient.nombres}</div>
                <div>Sesiones:{data.length}</div>
            </SessionHeader>
            <SessionsFilter>
                <IconSessions />
                <Criteria
                    type="text"
                    placeholder="Ingrese filtro"
                    value={criteria}
                    onChange={e => setCriteria(e.target.value)}
                />
            </SessionsFilter>
            <SessionList ref={sessionList}>
                {dataAndNew.map((s, i) =>
                    <div>
                        {(s.id !== selSession?.id)
                            ? <SessionCard key={i} onClick={e => onSelSession(e, s)}>
                                <SessionInfo>
                                    <Label>Fecha de sesión:</Label>
                                    {moment(s.fecha).format('DD/MM/YY')}
                                    <Label>Observaciones:</Label>
                                    <Alert alarm={s.fecha === undefined || s.fecha === null}>
                                        <IconAttachment/>
                                    </Alert>
                                </SessionInfo>
                                <Observaciones>
                                    {s.observaciones}
                                </Observaciones>
                            </SessionCard>
                            : <SessionForm>
                                <DatePicker
                                    placeholderText="Fecha de sesión"
                                    dateFormat="dd-MM-yyyy"
                                    maxDate={new Date()}
                                    selected={selSession.fecha}
                                    onChange={e => updateselSession('fecha', e != null ? e.getTime() : null)}
                                    className="customDatePicker"
                                />
                                <Attachments>
                                    <GlassButton onClick={chooseAttachment}>
                                        <IconUpload />
                                    </GlassButton>
                                    {/* <GlassButton
                                            background={(selSession.url || fileInfo) ? 'green' : 'gray'}
                                            onClick={e => viewFactura(e)}>
                                            <IconView />
                                        </GlassButton> */}
                                    {selSession.id !== 0 ? (
                                        <GlassButton onClick={e => removeSesion(e, s)}>
                                            <IconDelete />
                                        </GlassButton>)
                                        : <div></div>}
                                </Attachments>
                                <ObsArea
                                    type="text"
                                    placeholder="Observaciones"
                                    value={selSession.observaciones || ''}
                                    name="observaciones"
                                    onChange={e => updateselSession('observaciones', e.target.value)}
                                />
                                <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                                <GlassButton onClick={acceptChanges}>Aceptar</GlassButton>
                            </SessionForm>
                        }
                    </div>
                )}
            </SessionList>
            {selSession?.dirty
                ? null
                : <GlassButton
                    absolute
                    right={5}
                    bottom={5}
                    width={50}
                    height={50}
                    radius={50}
                    onClick={addSesionHandle}>
                    <IconAdd>+</IconAdd>
                </GlassButton>}
        </SessionsFrame>
    )
}

const SessionsFrame = styled.div`
	background: #ddd;
	height: 100%;
`
const SessionsFilter = styled.div`
	--id: SessionsFilter;
	background: #ccc;
	display: grid;
    grid-template-columns: 70px 1fr;
	align-items: center;
	box-shadow: 0 1px 3px black;
`
const Criteria = styled.input`
	--name: 'Criteria';
	font-size: 15px;
	color: #444;
	background: white;
	border-radius: 5px;
	width: 80%;
	height: 35px;
	border: none;
	display: block;
	margin: 10px 0;
	text-align: center;
	box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}

	/* @media screen and (min-width: 500px) {
        width:400px;
    }  */
`
const Label = styled.div`
	font-weight: bold;
	float: left;
`
const SessionHeader = styled.div`
	--id:SessionHeader;
	margin: 5px;
	font-size: 19px;
	color: black;
	display: grid;
	grid-template-columns: 1fr 120px;
	align-items: center;
	/* justify-content: center; */
`
const SessionList = styled.div`
    --id:SessionList
    background:white;
	overflow: auto;
	height: calc(100vh - 230px);
`
const SessionCard = styled.div`
    --id: SessionCard;
    background: #c1c0c0;
    padding: 8px 8px;
    border-radius: 5px;
    margin: 7px;
    box-shadow: 1px 1px 2px black;
    font-size: 12px;
    position: relative;
`
const SessionForm = styled.div`
	--id: SessionForm;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	padding: 10px;
`
const Attachments = styled.div`
	--id: Attachments;
	display: grid;
	grid-template-columns: 1fr 1fr 40px;
	grid-column-gap: 10px;
	align-items: center;
`
const SessionInfo = styled.div`
    padding: 0 5px;
    display: grid;
    grid-template-columns: 90px 1fr;
`
const Observaciones = styled.div`
	--id: Observaciones;
    padding: 8px;
    text-align: justify;
    border-radius: 5px;
    border: 1px solid black;
    box-shadow: inset 1px 1px 3px black;
    background: white;
`
const ObsArea = styled.textarea`
--name: ObsArea;
    grid-column: 1 / 3;
    padding: 5px 10px;
    font-size: 14px;
    color: #444;
    background: white;
    border-radius: 5px;
    width: 90%;
    height: 65px;
    border: none;
    margin: 10px auto;
    text-align: justify;
    box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}
`
const Alert = styled.div`
    --id: Alert;
    background: gray;
    box-shadow: inset 1px 1px;
    border-radius: 5px;
    width: 30px;
    height: 30px;
    justify-self: end;
    margin-top: -18px;
`
const IconAdd = styled.div`
	font-size: 24px;
	font-weight: bold;
`
const IconAttachment = styled(AttachOutline)`
    color:white;
    width:25px;
    padding:2px;
`
const IconSessions = styled(BackInTime)`
    color: ${props => (props.active ? '#1c88e6' : 'gray')};
    width: ${props => (props.active ? '38px' : '40px')};
    margin: 10px;
`
const IconView = styled(File)`
    width: 25px;
    color: white;
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
