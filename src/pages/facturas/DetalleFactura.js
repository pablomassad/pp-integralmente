import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'
import {FileUpload} from '@styled-icons/fa-solid/FileUpload'
import {Trash} from '@styled-icons/fa-solid/Trash'

import {useForm} from 'react-hook-form'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl, ui} from '../../redux'
import GlassButton from '../../common/GlassButton'
import Switch from "react-switch";

import moment from 'moment'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {registerLocale, setDefaultLocale} from "react-datepicker"
import es from 'date-fns/locale/es'


export default function DetalleFactura()
{
    const dispatch = useDispatch()
    const history = useHistory()
    const {register, handleSubmit, errors} = useForm()
    const selFactura = useSelector(st => st.fb.selFactura)

    const [factura, setFactura] = useState(selFactura)
    const [fileInfo, setFileInfo] = useState()
    const inputFile = useRef()

    const onSubmit = async (data) =>
    {
        if (fileInfo) {
            if (factura.nombre)
                await dispatch(bl.deleteFileStorage('facturas', factura.nombre))

            const obj = await dispatch(bl.uploadFile(fileInfo, 'facturas'))
            factura.url = obj.url
            factura.nombre = obj.nombre
        }
        const pl = {...factura, ...data}
        await dispatch(bl.updateFactura(selFactura.id, pl))
        dispatch(ui.showMessage({msg:'Factura guardada', type:'success'}))
    }
    const onChangeState = (e) =>
    {
        setFactura({...factura, estado: (e) ? 'Cobrada' : 'Pendiente'})
    }
    const onChangeFecha = (d) =>
    {
        setFactura({...factura, fecha: d.getTime()})
    }
    const onChangeFile = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()

        const fn = e.target.files[0].name
        setFileInfo(e.target.files[0])
        // dispatch(db.updateWidgetInfo({url: fn}))
        // setFileData(e.target.files[0])
    }
    const removeFile = () =>
    {

    }
    const cancelChanges = () =>
    {

    }
    const acceptChanges = () =>
    {

    }

    if (!factura) return null
    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <StatusDate>
                <Switch onChange={onChangeState}
                    className="react-switch"
                    id="icon-switch2"
                    checked={(factura.estado === 'Cobrada')}
                    handleDiameter={28}
                    offColor="#f00"
                    onColor="#3f3"
                    offHandleColor="#fff"
                    onHandleColor="#fff"
                    height={40}
                    width={70}
                    uncheckedIcon={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                fontSize: 15,
                                color: "white",
                                paddingRight: 2
                            }}
                        >
                            P
                    </div>
                    }
                    checkedIcon={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                fontSize: 15,
                                color: "white",
                                paddingRight: 2
                            }}
                        >
                            C
                    </div>
                    }
                    className="react-switch"
                    id="icon-switch" />
                <DatePicker
                    placeholderText="Nacimiento"
                    dateFormat="dd MMM yyyy"
                    maxDate={new Date()}
                    selected={factura.fecha}
                    onChange={onChangeFecha}
                    className="customDatePicker"
                    showYearDropdown
                />
                <UserInput type="text" placeholder="Obra Social" defaultValue={factura.obrasocial} name="obrasocial" ref={register({required: true})} />
                <UserInput type="number" placeholder="Monto" defaultValue={factura.monto} name="monto" ref={register({required: true})} />
            </StatusDate>

            <UserInput type="text" placeholder="Observaciones" defaultValue={factura.observaciones} name="observaciones" ref={register} />
            <ArchivoFrame>
                <GlassButton height="40" width="40" onClick={() => inputFile.current.click()}>
                    <input type='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFile} />
                    <IconUpload />
                </GlassButton>
                <Filename>
                    {factura.archivo}
                </Filename>
                <GlassButton height="40" width="40" onClick={removeFile}>
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

const Form = styled.form`
    background:#ddd;
    overflow:auto;
    height: calc(100vh - 135px);
`
const StatusDate = styled.div`
    display:grid;
    grid-template-columns:1fr 1fr;
    justify-items: center;
    align-items: center;
`
const ArchivoFrame = styled.div`
    display:grid;
    grid-template-columns:60px 1fr 60px;
    align-items:center;
`
const Filename = styled.div`
    font-size:12px;
    font-weight:bold;
    text-align:center;
`
const IconUpload = styled(FileUpload)`
    width:15px;
    color:white;
`
const IconRemove = styled(Trash)`
    width:15px;
    color:white;
`
const Actions = styled.div`
    display:grid;
    grid-template-columns:1fr 1fr 1fr;
    margin-top:30px;
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