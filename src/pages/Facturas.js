import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'
import {AttachMoney} from '@styled-icons/material-sharp/AttachMoney'
import {FileUpload} from '@styled-icons/fa-solid/FileUpload'
import {File} from '@styled-icons/boxicons-regular/File'
import {Trash} from '@styled-icons/heroicons-outline/Trash'
import GlassButton from '../common/GlassButton'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl, fb, ui} from '../redux'

import moment from 'moment'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {registerLocale, setDefaultLocale} from "react-datepicker"
import es from 'date-fns/locale/es'

import {useForm} from 'react-hook-form'
import {confirmAlert} from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

export default function Facturas()
{
    const history = useHistory()
    const dispatch = useDispatch()

    const {register, handleSubmit, errors} = useForm()

    const [criteria, setCriteria] = useState('')
    const facturas = useSelector(st => st.fb.facturas)
    const userInfo = useSelector(st => st.fb.userInfo)

    const [fileInfo, setFileInfo] = useState()
    const inputFile = useRef()

    const [selFacturaId, setSelFacturaId] = useState('')
    
    const [pendientes, setPendientes] = useState([])
    const [cobradas, setCobradas] = useState([])
    const [TotalPendientes, setTotalPendientes] = useState(0)
    const [TotalCobradas, setTotalCobradas] = useState(0)

    const filterFacturas = () =>
    {
        const pend = []
        let totPend = 0

        facturas.map(f =>
        {
            if (f.estado === 'Pendiente') {
                totPend += parseFloat(f.monto)
                pend.push(f)
            }
            return f
        })
        setPendientes(pend)
        setTotalPendientes(totPend)
    }
    const changeCriteriaHandle = (e) =>
    {
        setCriteria(e.target.value)
    }
    const uploadFactura = (e, f) =>
    {
        e.stopPropagation()
        e.preventDefault()
    }
    const removeFactura = (e, f) =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar factura',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeFactura({id: f.id}))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }
    const viewFactura = (e, f) =>
    {
        e.stopPropagation()
        e.preventDefault()
    }
    const onSelFactura = (e, f) =>
    {
        e.stopPropagation()
        e.preventDefault()
        setSelFacturaId(f.id)
    }
    const onChangeFecha = (d) =>
    {
        // setFactura({...factura, fecha: d.getTime()})
    }
    const onSubmit = async (data) =>
    {
        console.log('data: ', data)
        // if (fileInfo) {
        //     if (factura.nombre)
        //         await dispatch(bl.deleteFileStorage('facturas', factura.nombre))

        //     const obj = await dispatch(bl.uploadFile(fileInfo, 'facturas'))
        //     factura.url = obj.url
        //     factura.nombre = obj.nombre
        // }
        // const pl = {...factura, ...data}
        // await dispatch(bl.updateFactura(selFactura.id, pl))
        // dispatch(ui.showMessage({msg: 'Factura guardada', type: 'success'}))
    }
    const cancelChanges = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()
        setSelFacturaId('')
    }
    const acceptChanges = () =>
    {
        console.log('acceptChanges', selFacturaId)
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

    useEffect(() =>
    {
        filterFacturas()
    }, [facturas])

    useEffect(() =>
    {
        if (userInfo)
            dispatch(bl.getFacturas()).then(x =>
            {
                if (x == true)
                    dispatch(ui.showMessage({msg: 'Facturas OK', type: 'info'}))
            })
        else
            history.replace('/')
    }, [])

    return (
        <FacturasFrame>
            <FacturasFilter>
                <IconFacturas />
                <Criteria type="text"
                    placeholder="Ingrese filtro"
                    value={criteria}
                    onChange={(e) => changeCriteriaHandle(e)} />
            </FacturasFilter>
            <FacturasLayout>
                <Title>
                    Pendientes:
                        <Total estado="Pendientes">{TotalPendientes}</Total>
                </Title>
                <FacturasList>
                    {pendientes.map((f, i) => (
                        <FactItem key={i} onClick={(e) => onSelFactura(e, f)}>
                            {(f.id !== selFacturaId) ? (
                                <FacturaCard>
                                    <Cell><Label>Emitida:</Label>{moment(f.fecha).format('DD/MM/YY')}</Cell>
                                    <Cell><Label>Pago:</Label>{(f.fechaPago) ? moment(f.fechaPago).format('DD/MM/YY') : ''}</Cell>
                                    <Cell><Label>O.Social:</Label>{f.obrasocial}</Cell>
                                    <Cell><Label>Monto</Label>${f.monto}</Cell>
                                    <Cell><Label>Nr:</Label>{f.nro}</Cell>
                                    <Cell>
                                        <Alert alarm={!f.fechaPago}>$</Alert>
                                        <Alert alarm={!f.file}>PDF</Alert>
                                    </Cell>
                                </FacturaCard>
                            ) : (
                                    <FacturaForm onSubmit={handleSubmit(onSubmit)}>
                                        <DatePicker
                                            placeholderText="Fecha de Emisión"
                                            dateFormat="dd-MM-yyyy"
                                            maxDate={new Date()}
                                            selected={f.fecha}
                                            onChange={onChangeFecha}
                                            className="customDatePicker"
                                        />
                                        <DatePicker
                                            placeholderText="Fecha de Pago"
                                            dateFormat="dd-MM-yyyy"
                                            maxDate={new Date()}
                                            selected={f.fechaPago}
                                            onChange={onChangeFecha}
                                            className="customDatePicker"
                                        />
                                        <UserInput type="text" placeholder="Obra Social" defaultValue={f.obrasocial} name="obrasocial" ref={register({required: true})} />
                                        <UserInput type="number" placeholder="Monto" defaultValue={f.monto} name="monto" ref={register({required: true})} style={{textAlign: 'right'}} />

                                        <UserInput type="number" placeholder="Nr.Factura" defaultValue={f.numero} name="monto" ref={register({required: true})} />
                                        <FacturaPDF>
                                            <GlassButton onClick={(e) => uploadFactura(e, f)}>
                                                <IconUpload />
                                            </GlassButton>
                                            <GlassButton background={(f.file) ? "green" : "gray"} onClick={(e) => viewFactura(e, f)}>
                                                <IconView />
                                            </GlassButton>
                                            <GlassButton onClick={(e) => viewFactura(e, f)}>
                                                <IconDelete onClick={(e) => removeFactura(e, f)} style={{width: '20px'}} />
                                            </GlassButton>
                                        </FacturaPDF>
                                        <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                                        <GlassButton onClick={acceptChanges}>Aceptar</GlassButton>
                                    </FacturaForm>
                                )}
                        </FactItem>
                    ))}
                </FacturasList>
            </FacturasLayout>
        </FacturasFrame>
    )
}


const FacturasFrame = styled.div`
    background:#ddd;
    height:100%;
`
const FacturasFilter = styled.div`
    --id:PatientFilter;
    background:#ccc;
    display:grid;
    grid-template-columns:50px 1fr;
    align-items:center;
    box-shadow: 0 1px 3px black;
`
const Criteria = styled.input`
    --name: 'Criteria';
    padding: 5px 10px;
    font-size: 15px;
    color: #444;
    background: white;
    border-radius: 5px;
    width: 80%;
    height: 35px;
    border: none;
    display: block;
    margin: 20px auto;
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
    font-weight:bold;
    float:left;
`
const Status = styled.div`
    text-align:right;
`
const Title = styled.div`
    --id:Title;
    margin: 8px;
    font-size: 19px;
    color: #444;
    display: grid;
    grid-template-columns: 1fr 2fr;
`
const Total = styled.div`
    margin-left:10px;
    font-size:19px;
    font-weight:bold;
    color:${props => (props.estado === 'Pendientes') ? 'red' : 'green'};
`
const FacturasLayout = styled.div`
    --id:FacturasLayout;
    margin-top: 3px;
`
const FacturasList = styled.div`
    overflow:auto;
    height: calc(100vh - 150px);
`
const FactItem = styled.div`
    --id:FactItem;
    background: white;
    padding: 0 3px;
    border-radius: 3px;
    margin: 4px;
    box-shadow: 1px 1px 2px black;
    font-size: 12px;
    position: relative;
`
const FacturaCard = styled.div`
    --id:FacturaCard;
    display: grid;
    grid-template-columns:1fr 1fr;
    align-items:center;
    padding:10px;
    grid-gap: 5px;
    grid-column-gap: 15px;
`
const FacturaForm = styled.div`
    --id:FacturaForm;
    display: grid;
    grid-template-columns:1fr 1fr;
    align-items:center;
    padding:10px;
`
const FacturaPDF = styled.div`
    --id:FacturaPDF;
    display:grid;
    grid-template-columns:1fr 1fr 40px;
    grid-column-gap:10px;
    align-items:center;
`
const Cell = styled.div`
    --id:Cell;
    text-align:right;
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
const Alert = styled.div`
    margin-left: 10px;
    border-radius: 5px;
    box-shadow: 1px 1px 2px grey;
    color: white;
    float: right;
    width: 30px;
    text-align: center;
    font-size:11px;
    text-shadow:1px 1px 1px gray;
    background: ${props => (props.alarm) ? 'red' : 'gray'};
`
const IconFacturas = styled(AttachMoney)`
    color: ${props => (props.active) ? '#1c88e6' : 'gray'};
    width: ${props => (props.active) ? '38px' : '40px'};
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