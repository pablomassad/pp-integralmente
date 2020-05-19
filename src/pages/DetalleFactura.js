import React from 'react'
import styled from 'styled-components'
import {FileUpload} from '@styled-icons/fa-solid/FileUpload'
import {Trash} from '@styled-icons/fa-solid/Trash'

import {useForm} from 'react-hook-form'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl} from '../../redux'
import GlassButton from '../common/GlassButton'

import moment from 'moment'


export default function DetalleFactura()
{
    const dispatch = useDispatch()
    const history = useHistory()
    const {register, handleSubmit, errors} = useForm()
    const selFactura = useSelector(st => st.fb.selFactura)


    const uploadFile = ()=>{

    }
    const removeFile = ()=>{
        
    }
    const cancelChanges = ()=>{
        
    }
    const acceptChanges = ()=>{
        
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Switch></Switch>
            <DatePicker
                placeholderText="Nacimiento"
                dateFormat="dd/MMM/yyyy"
                maxDate={new Date()}
                // locale="es"
                selected={selFactura.fecha}
                onChange={onChangeFecha}
                className="customDatePicker"
                showYearDropdown
                ref={register({required: true})}
            />
            <UserInput type="text" placeholder="Obra Social" defaultValue={selFactura.obrasocial} name="obrasocial" ref={register({required: true})} />
            <UserInput type="number" placeholder="Monto" defaultValue={selFactura.monto} name="monto" ref={register({required: true})} />
            <UserInput type="text" placeholder="Observaciones" defaultValue={selFactura.observaciones} name="observaciones" ref={register} />
            <ArchivoFrame>
                <GlassButton height="40" onClick={uploadFile}>
                    <IconUpload />
                </GlassButton>
                <Filename>
                    {selFactura.archivo}
                </Filename>
                <GlassButton height="40" onClick={removeFile}>
                    <IconRemove />
                </GlassButton>
            </ArchivoFrame>
            <Actions>
                <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                <div></div>
                <GlassButton onClick={acceptChanges}>Aceptar</GlassButton>
            </Actions>
        </Form>
    )
}


const ArchivoFrame = styled.div`
    display:grid;
    grid-template-columns:40px 1fr 40px;
    align-items:center;
`
const Filename = styled.div`
    font-size:12px;
    font-weight:bold;
    text-align:center;
`
const IconUpload = styled(FileUpload)`
    width:30px;
    color:gray;
`
const IconRemove = styled(Trash)`
    width:30px;
    color:gray;
    align-self:center;
`
const Actions = styled.div`
    display:grid;
    grid-template-columns:1fr 1fr 1fr;
`

const UserInput = styled.input`
    --name: 'UserInput';
    padding: 5px 10px;
    font-size: 15px;
    color: #444;
    background: white;
    border-radius: 5px;
    width: 80%;
    height: 35px;
    border: none;
    display: block;
    margin: 10px auto;
    text-align: center;
    box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}
`