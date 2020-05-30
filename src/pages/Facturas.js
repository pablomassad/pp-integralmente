import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'
import {AttachMoney} from '@styled-icons/material-sharp/AttachMoney'
import {FileUpload} from '@styled-icons/fa-solid/FileUpload'
import {File} from '@styled-icons/boxicons-regular/File'
import {Trash} from '@styled-icons/heroicons-outline/Trash'
import GlassButton from '../common/GlassButton'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector, shallowEqual} from 'react-redux'
import {bl, ui} from '../redux'

import Switch from 'react-switch'

import moment from 'moment'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {registerLocale, setDefaultLocale} from 'react-datepicker'
import es from 'date-fns/locale/es'

import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

import {confirmAlert} from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css


export default function Facturas()
{
    console.log('......[Facturas]')
    const history = useHistory()
    const dispatch = useDispatch()

    const facturas = useSelector(st => st.fb.facturas, shallowEqual)
    const userInfo = useSelector(st => st.fb.userInfo)

    const [fileInfo, setFileInfo] = useState()
    const inputFile = useRef()
    const factList = useRef()

    const [criteria, setCriteria] = useState('')
    const fields = [
        {value: 'fecha', label: 'Fecha'},
        {value: 'fechaPago', label: 'Fecha Pago'},
        {value: 'obrasocial', label: 'Obra Social'},
        {value: 'monto', label: 'Monto'},
        {value: 'nro', label: 'Num.Factura'}
    ]
    const [selField, setSelField] = useState(fields[0])
    const [selDirection, setSelDirection] = useState('asc')
    const [selFactura, setSelFactura] = useState(null)
    const [selEstado, setSelEstado] = useState('Pendiente')

    const data = facturas
        .filter((f) => criteria.length < 3 || Object.keys(f).some((k) => `${f[k]}`.toLowerCase().includes(criteria.toLowerCase())))
        .filter((f) => f.estado === selEstado)
        .map((f) => selFactura?.id === f.id ? selFactura : f)
        .sort((f1, f2) =>
        {
            const d1 = f1[selField.value]
            const d2 = f2[selField.value]
            if (typeof d1 === 'number') {
                return selDirection === 'asc' ? d1 - d2 : d2 - d1;
            }
            const s1 = `${d1}`;
            const s2 = `${d2}`;
            return selDirection === 'asc' ? s1.localeCompare(s2) : s2.localeCompare(s1);
        });

    const dataAndNew = (selFactura?.id === 0 ? [selFactura] : []).concat(data)

    const total = data.reduce((acc, f) => acc + Number.parseInt(f.monto), 0);

    const onSelectFieldHandle = e =>
    {
        setSelField(e)
    }
    const onSelDirectionHandle = e =>
    {
        const newDir = selDirection === 'asc' ? 'desc' : 'asc'
        setSelDirection(newDir)
    }
    const onChangeState = e =>
    {
        const newState = e ? 'Cobrada' : 'Pendiente'
        setSelEstado(newState)
    }
    const removeFactura = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar factura',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeFactura({id: selFactura.id}))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }
    const viewFactura = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        if (selFactura.url) {
            window.open(selFactura.url, '_system', 'location=yes')
        }
        if (fileInfo) {
            // console.log('view PDF')
            // fetch(f.url)
            // 	.then(response => {
            // 		response.blob().then(blob => {
            let url = window.URL.createObjectURL(fileInfo)
            let a = document.createElement('a')
            a.href = url
            a.download = fileInfo.name
            a.click()
            //window.location.href = response.url;
        }
    }
    const onSelFactura = f =>
    {
        if (selFactura?.dirty) return // Factura en edicion

        const newBill = {...f}
        console.log('onSelFactura', newBill)
        setSelFactura(newBill)
    }
    const updateSelFactura = (field, value) =>
    {
        const newBill = {...selFactura, [field]: value, dirty: true}
        setSelFactura(newBill)
    }
    const addFacturaHandle = () =>
    {
        const newFactura = {id: 0, dirty: true}
        setSelFactura(newFactura)
        factList.current.scrollTo(0, 0) //factList.current.scrollHeight+1000)
    }
    const cancelChanges = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        setSelFactura(null)
    }
    const acceptChanges = async () =>
    {
        if (fileInfo) {
            if (selFactura.nombre) {
                //    await dispatch(bl.deleteFileStorage('facturas', selFactura.nombre))
                console.log('nombre existente: ', selFactura.nombre)
            }

            const url = await dispatch(bl.uploadFileStorage('facturas', fileInfo))
            selFactura.url = url
            selFactura.nombre = fileInfo.name
        }
        console.log('updated Factura: ', selFactura)
        const res = await dispatch(bl.updateFactura(selFactura))
        if (res) {
            dispatch(ui.showMessage({msg: 'Factura guardada', type: 'success'}))
            setFileInfo(undefined)
            setSelFactura(null)
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar la factura', type: 'error'}))
        }
    }
    const choosePDF = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        inputFile.current.click()
    }
    const onChangePDF = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        console.log('file: ', e.target.files[0])
        setFileInfo(e.target.files[0])
    }

    useEffect(() =>
    {
        if (userInfo)
            dispatch(bl.getFacturas())
        else history.replace('/')
    }, [])

    return (
        <FacturasFrame>
            <input type="file" ref={inputFile} style={{display: 'none'}} onChange={onChangePDF} />
            <FacturasFilter>
                <IconFacturas />
                <Criteria
                    type="text"
                    placeholder="Ingrese filtro"
                    value={criteria}
                    onChange={e => setCriteria(e.target.value)}
                />
                <Switch
                    onChange={onChangeState}
                    className="react-switch"
                    id="icon-switch2"
                    checked={selEstado === 'Cobrada'}
                    handleDiameter={25}
                    offColor="#d00"
                    onColor="#3a3"
                    offHandleColor="#fff"
                    onHandleColor="#fff"
                    height={30}
                    width={60}
                    uncheckedIcon={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                fontSize: 15,
                                color: 'white',
                                paddingRight: 2,
                                textShadow: '1px 1px 1px black'
                            }}>
                            P
						</div>
                    }
                    checkedIcon={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                fontSize: 15,
                                color: 'white',
                                textShadow: '1px 1px 1px black'
                            }}>
                            C
						</div>
                    }
                    className="react-switch"
                    id="icon-switch"
                />
            </FacturasFilter>
            <FacturasLayout>
                <FactHeader>
                    <div>
                        Total:({data.length}) $
					</div>
                    <Total>
                        {total}
                    </Total>
                    <Dropdown
                        controlClassName="comboFieldsControl"
                        arrowClosed={<span />}
                        arrowOpen={<span />}
                        options={fields}
                        onChange={onSelectFieldHandle}
                        value={selField}
                        placeholder="Orden por"
                    />
                    <div onClick={onSelDirectionHandle} style={{textAlign: 'right'}}>
                        {selDirection === 'asc' ? <div>🔼</div> : <div>🔽</div>}
                    </div>
                </FactHeader>
                <FacturasList ref={factList}>
                    {dataAndNew.map((f, i) =>
                        <FactItem key={i}>
                            {f.id !== selFactura?.id
                                ? <FacturaCard onClick={e => onSelFactura(f)}>
                                    <Cell>
                                        <Label>Emitida:</Label>
                                        {moment(f.fecha).format('DD/MM/YY')}
                                    </Cell>
                                    <Cell>
                                        <Label>Pago:</Label>
                                        {f.fechaPago ? moment(f.fechaPago).format('DD/MM/YY') : ''}
                                    </Cell>
                                    <Cell>
                                        <Label>O.Social:</Label>
                                        {f.obrasocial}
                                    </Cell>
                                    <Cell>
                                        <Label>Monto</Label>${f.monto}
                                    </Cell>
                                    <Cell>
                                        <Label>Nr:</Label>
                                        {f.nro}
                                    </Cell>
                                    <Cell>
                                        <Alert alarm={f.fechaPago === undefined || f.fechaPago === null}>$</Alert>
                                        {!f.nombre ? <Alert alarm={!f.nombre}>PDF</Alert> : null}
                                    </Cell>
                                </FacturaCard>
                                : <FacturaForm>
                                    <DatePicker
                                        placeholderText="Fecha de Emisión"
                                        dateFormat="dd-MM-yyyy"
                                        maxDate={new Date()}
                                        selected={selFactura.fecha}
                                        onChange={e => updateSelFactura('fecha', e != null ? e.getTime() : null)}
                                        className="customDatePicker"
                                    />
                                    <DatePicker
                                        placeholderText="Fecha de Pago"
                                        dateFormat="dd-MM-yyyy"
                                        maxDate={new Date()}
                                        selected={selFactura.fechaPago}
                                        onChange={e => updateSelFactura('fechaPago', e != null ? e.getTime() : null)}
                                        className="customDatePicker"
                                    />
                                    <UserInput
                                        type="text"
                                        placeholder="Obra Social"
                                        value={selFactura.obrasocial || ''}
                                        name="obrasocial"
                                        onChange={e => updateSelFactura('obrasocial', e.target.value)}
                                    />
                                    <UserInput
                                        type="number"
                                        placeholder="Monto"
                                        value={selFactura?.monto || ''}
                                        name="monto"
                                        onChange={e => updateSelFactura('monto', e.target.value)}
                                        style={{textAlign: 'right'}}
                                    />

                                    <UserInput
                                        type="number"
                                        placeholder="Nr.Factura"
                                        value={selFactura.nro || ''}
                                        name="numFactura"
                                        onChange={e => updateSelFactura('nro', e.target.value)}
                                    />
                                    <FacturaPDF>
                                        <GlassButton onClick={choosePDF}>
                                            <IconUpload />
                                        </GlassButton>
                                        <GlassButton
                                            background={(selFactura.url || fileInfo) ? 'green' : 'gray'}
                                            onClick={e => viewFactura(e)}>
                                            <IconView />
                                        </GlassButton>
                                        {selFactura.id !== 0 ? (
                                            <GlassButton onClick={e => removeFactura(e, f)}>
                                                <IconDelete />
                                            </GlassButton>)
                                            : <div></div>}
                                    </FacturaPDF>
                                    <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                                    <GlassButton onClick={acceptChanges}>Aceptar</GlassButton>
                                </FacturaForm>}
                        </FactItem>
                    )}
                </FacturasList>
            </FacturasLayout>
            {selFactura?.dirty
                ? null
                : <GlassButton
                    absolute
                    right={5}
                    bottom={5}
                    width={50}
                    height={50}
                    radius={50}
                    onClick={addFacturaHandle}>
                    <IconAdd>+</IconAdd>
                </GlassButton>}
        </FacturasFrame>
    )
}

const FacturasFrame = styled.div`
	background: #ddd;
	height: 100%;
`
const FacturasFilter = styled.div`
	--id: PatientFilter;
	background: #ccc;
	display: grid;
	grid-template-columns: 50px 1fr 80px;
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
const Status = styled.div`text-align: right;`
const FactHeader = styled.div`
	--id: FactHeader;
	margin: 5px;
	font-size: 19px;
	color: black;
	display: grid;
	grid-template-columns: 100px 1fr 150px 30px;
	align-items: center;
	/* justify-content: center; */
`
const Total = styled.div`
	font-weight: bold;
	color: black;
`
const OrderFields = styled.div``
const FacturasLayout = styled.div`--id: FacturasLayout;`
const FacturasList = styled.div`
	overflow: auto;
	height: calc(100vh - 155px);
`
const FactItem = styled.div`
	--id: FactItem;
	background: white;
	padding: 0 3px;
	border-radius: 3px;
	margin: 4px;
	box-shadow: 1px 1px 2px black;
	font-size: 12px;
	position: relative;
`
const FacturaCard = styled.div`
	--id: FacturaCard;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	padding: 10px;
	grid-gap: 5px;
	grid-column-gap: 15px;
`
const FacturaForm = styled.div`
	--id: FacturaForm;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	padding: 10px;
`
const FacturaPDF = styled.div`
	--id: FacturaPDF;
	display: grid;
	grid-template-columns: 1fr 1fr 40px;
	grid-column-gap: 10px;
	align-items: center;
`
const Cell = styled.div`
	--id: Cell;
	text-align: right;
    border-bottom: 1px solid lightgray;
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
	background: ${props => (props.alarm ? 'red' : 'gray')};
	box-shadow: ${props => (props.alarm ? '1px 1px 2px gray' : 'none')};
	margin-left: 10px;
	border-radius: 5px;
	color: white;
	float: right;
	width: 30px;
	text-align: center;
	font-size: 11px;
	text-shadow: 1px 1px 1px gray;
`
const IconAdd = styled.div`
	font-size: 24px;
	font-weight: bold;
`
const IconFacturas = styled(AttachMoney)`
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
