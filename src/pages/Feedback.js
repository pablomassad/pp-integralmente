import React, {useState, useEffect} from 'react'
import styled from 'styled-components'

import {BackInTime} from '@styled-icons/entypo/BackInTime'

import GlassButton from '../common/GlassButton'
import {useDispatch, useSelector, shallowEqual} from 'react-redux'
import {bl, ui} from '../redux'

import 'react-confirm-alert/src/react-confirm-alert.css' // Import css


export default function Feedback()
{
    console.log('......[Feedback]')
    const dispatch = useDispatch()

    const userInfo = useSelector(st => st.fb.userInfo)
    const initialFeedback = {
        fecha: new Date().getTime(),
        autor: userInfo.displayName,
        observacion: ''
    }
    const [feedback, setFeedback] = useState(initialFeedback)

    const updateFeedback = (e) =>
    {
        dispatch(ui.setDirty(true))
        setFeedback({...feedback, observacion: e.target.value})
    }
    const cancelChanges = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        dispatch(ui.setDirty(true))
        setFeedback({...feedback, observacion: ''})
    }
    const acceptChanges = async () =>
    {
        const res = await dispatch(bl.addFeedback(feedback))
        if (res) {
            dispatch(ui.showMessage({msg: 'Mejora guardada', type: 'success'}))
            setFeedback({...feedback, observacion: ''})
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar la mejora', type: 'error'}))
        }
    }

    useEffect(() =>
    {
        dispatch(ui.setTitle('Mejoras'))
    }, [])

    return (
        <FBFrame>
            <Comentario
                type="text"
                value={feedback.observacion}
                placeholder="Ingrese comentarios, criticas o mejoras...."
                name="observacion"
                onChange={e => updateFeedback(e)}
            />
            <Options>
                <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                <div></div>
                <GlassButton disabled={!feedback.observacion} onClick={acceptChanges}>Aceptar</GlassButton>
            </Options>
        </FBFrame>
    )
}

const FBFrame = styled.div`
    --id:FBFrame;
	height: 100vh;
    max-width:500px;
    margin:auto;
`
const Comentario = styled.textarea`
    --id: Comentario;
    padding: 5px 10px;
    font-size: 14px;
    color: #444;
    background: white;
    border-radius: 5px;
    width: 90%;
    height: 200px;
    margin: 10px;
    box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}
`

const Options = styled.div`
    display:grid;
    grid-template-columns:200px 1fr 200px;
    align-items:center;
`
const IconAdd = styled.div`
	font-size: 24px;
	font-weight: bold;
`

const IconNews = styled(BackInTime)`
    color: ${props => (props.active ? '#1c88e6' : 'gray')};
    width: ${props => (props.active ? '38px' : '40px')};
    margin: 10px;
`
