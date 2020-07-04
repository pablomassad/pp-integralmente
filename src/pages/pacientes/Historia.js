import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'

import {BackInTime} from '@styled-icons/entypo/BackInTime'
import {Trash} from '@styled-icons/heroicons-outline/Trash'

import GlassButton from '../../common/GlassButton'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector, shallowEqual} from 'react-redux'
import {bl, ui} from '../../redux'

import moment from 'moment'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import {confirmAlert} from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css


export default function Historia()
{
    console.log('......[Historia]')
    const history = useHistory()
    const dispatch = useDispatch()

    const dirty = useSelector(st=>st.ui.dirty)
    const sessions = useSelector(st => st.fb.sessions, shallowEqual)
    const selPatient = useSelector(st => st.fb.selPatient, shallowEqual)

    const [fileInfo, setFileInfo] = useState()
    const sessionList = useRef()

    const [criteria, setCriteria] = useState('')
    const [selSession, setSelSession] = useState(null)

    const data = sessions
        .filter((s) => criteria.length < 3 || Object.keys(s).some((k) => `${s[k]}`.toLowerCase().includes(criteria.toLowerCase())))
        .map((s) => selSession?.id === s.id ? selSession : s)
        .sort((f1, f2) =>
        {
            const d1 = f1['fecha']
            const d2 = f2['fecha']
            if (typeof d1 === 'number') {
                return d2 - d1;
            }
            const s1 = `${d1}`;
            const s2 = `${d2}`;
            return s2.localeCompare(s1);
        });

    const dataAndNew = (selSession?.id === 0 ? [selSession] : []).concat(data)

    const removeSessionHandle = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar Sesión',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeSession(selPatient.id, selSession.id))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }
    const onSelSession = (e, s) =>
    {
        e.preventDefault()
        if (dirty) return // Factura en edicion

        const newSession = {...s}
        console.log('onSelSession', newSession)
        setSelSession(newSession)
    }
    const updateSelSession = (field, value) =>
    {
        dispatch(ui.setDirty(true))
        const newSession = {...selSession, [field]: value}
        setSelSession(newSession)
    }
    const addSessionHandle = () =>
    {
        dispatch(ui.setDirty(true))
        const newSession = {id: 0}
        setSelSession(newSession)
        sessionList.current.scrollTo(0, 0) //sessionList.current.scrollHeight+1000)
    }
    const cancelChanges = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        dispatch(ui.setDirty(false))
        setSelSession(null)
    }
    const acceptChanges = async () =>
    {
        if (fileInfo) {
            if (selSession.nombre) {
                //    await dispatch(bl.deleteFileStorage('facturas', selFactura.nombre))
                console.log('nombre existente: ', selSession.nombre)
            }

            const url = await dispatch(bl.uploadFileStorage('sesiones', fileInfo.file))
            selSession.url = url
            selSession.nombre = fileInfo.file.name
        }
        console.log('updated Session: ', selSession)
        const res = await dispatch(bl.updateSession(selPatient.id, selSession))
        if (res) {
            dispatch(ui.showMessage({msg: 'Sesión guardada', type: 'success'}))
            setFileInfo(undefined)
            setSelSession(null)
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar la sesión', type: 'error'}))
        }
    }


    useEffect(() =>
    {
        if (selPatient)
            dispatch(bl.getSessionsByPatient(selPatient.id))
    }, [dispatch, history, selPatient])

    return (
        <SessionsFrame>
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
                    <div key={i} >
                        {(s.id !== selSession?.id)
                            ? <SessionCard onClick={e => onSelSession(e, s)}>
                                <SessionInfo>
                                    <Label>Fecha de sesión:</Label>
                                    {moment(s.fecha).format('DD/MM/YY')}
                                    <Label>Observaciones:</Label>
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
                                    onChange={e => updateSelSession('fecha', e != null ? e.getTime() : null)}
                                    className="customDatePicker"
                                />
                                {selSession.id !== 0 ? (
                                    <GlassButton height={40} width={40} onClick={e => removeSessionHandle(e, s)}>
                                        <IconDelete />
                                    </GlassButton>)
                                    : <div></div>}
                                <ObsArea
                                    type="text"
                                    placeholder="Observaciones"
                                    value={selSession.observaciones || ''}
                                    name="observaciones"
                                    onChange={e => updateSelSession('observaciones', e.target.value)}
                                />
                                <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                                <GlassButton onClick={acceptChanges}>Aceptar</GlassButton>
                            </SessionForm>
                        }
                    </div>
                )}
            </SessionList>
            {dirty
                ? null
                : <GlassButton
                    fixed
                    right={5}
                    bottom={5}
                    width={50}
                    height={50}
                    radius={50}
                    onClick={addSessionHandle}>
                    <IconAdd>+</IconAdd>
                </GlassButton>}
        </SessionsFrame>
    )
}

const SessionsFrame = styled.div`
	background: #fff;
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
`
const SessionList = styled.div`
    --id:SessionList;
    background:lightgray;
	overflow: auto;
	height: calc(100vh - 230px);
`
const SessionCard = styled.div`
    --id: SessionCard;
    background: #bbb;
    padding: 8px 8px;
    border-radius: 5px;
    margin: 7px;
    box-shadow: 1px 1px 2px black;
    font-size: 14px;
    position: relative;
`
const SessionForm = styled.div`
    --id: SessionForm;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 10px;
    background: #bbb;
    margin: 20px 7px;
    box-shadow: inset 2px 2px 5px #555;
    border-radius: 5px;
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
const IconAdd = styled.div`
	font-size: 24px;
	font-weight: bold;
`

const IconSessions = styled(BackInTime)`
    color: ${props => (props.active ? '#1c88e6' : 'gray')};
    width: ${props => (props.active ? '38px' : '40px')};
    margin: 10px;
`
const IconDelete = styled(Trash)`
    width:25px;
    color: white;
`
