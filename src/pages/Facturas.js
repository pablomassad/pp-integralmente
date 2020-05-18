import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {IconRemove} from '../global-styles'
import {AttachMoney} from '@styled-icons/material-sharp/AttachMoney'

import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl, fb} from '../redux'
import moment from 'moment'

import {confirmAlert} from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

export default function Facturas()
{
    console.log('....[Facturas]')

    const history = useHistory()
    const dispatch = useDispatch()
    const [criteria, setCriteria] = useState('')
    const facturas = useSelector(st => st.fb.facturas)
    const userInfo = useSelector(st => st.fb.userInfo)

    const [pendientes, setPendientes] = useState([])
    const [cobradas, setCobradas] = useState([])
    const [TotalPendientes, setTotalPendientes] = useState(0)
    const [TotalCobradas, setTotalCobradas] = useState(0)

    const filterFacturas = () =>
    {
        const pend = []
        const cob = []
        let totPend = 0
        let totCob = 0

        facturas.map(f =>
        {
            if (f.estado === 'Pendiente') {
                totPend += parseFloat(f.monto)
                pend.push(f)
            }
            if (f.estado === 'Cobrada') {
                totCob += parseFloat(f.monto)
                cob.push(f)
            }
            return f
        })

        setPendientes(pend)
        setCobradas(cob)
        setTotalPendientes(totPend)
        setTotalCobradas(totCob)
    }
    const changeCriteriaHandle = (e) =>
    {
        setCriteria(e.target.value)
    }

    const showFactura = (e,f) =>
    {
        e.stopPropagation()
        e.preventDefault()
        //abrir PDF
    }   
    const changeState = (e,f) =>
    {
        e.stopPropagation()
        e.preventDefault()
        let newEstado = (f.estado === 'Pendiente')?'Cobrada':'Pendiente'
        dispatch(bl.updateFactura({id:f.id, estado:newEstado}))
    }
    const removeFactura = (e,f) =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar factura',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeFactura({id:f.id}))
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
        filterFacturas()
    }, [facturas])

    useEffect(() =>
    {
        if (userInfo)
            dispatch(bl.getFacturas())
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
                <Pendientes>
                    <Title>
                        Pendientes:
                        <Total estado="Pendientes">{TotalPendientes}</Total>
                    </Title>
                    <FacturasList>
                        {pendientes.map((f, i) => (
                            <FactItem key={i}>
                                <Fecha>{moment(f.fecha).format('DD/MM/YY')}</Fecha>
                                <div>{f.obrasocial}</div>
                                <Monto>${f.monto}</Monto>
                                <IconRemove onClick={(e) => removeFactura(e, f)} style={{width:'20px', marginTop:'3px'}}/>
                            </FactItem>
                        ))}
                    </FacturasList>
                </Pendientes>
                <Cobradas>
                    <Title>
                        Cobradas:
                        <Total estado="Cobradas">{TotalCobradas}</Total>
                    </Title>
                    <FacturasList>
                        {cobradas.map((f, i) => (
                            <FactItem key={i} onClick={(e) => showFactura(e, f)}>
                                <Fecha>{moment(f.fecha).format('DD/MM/YY')}</Fecha>
                                <div>{f.obrasocial}</div>
                                <Monto>${f.monto}</Monto>
                                <IconRemove onClick={(e) => removeFactura(e, f)} style={{width:'20px', marginTop:'3px'}} />
                            </FactItem>
                        ))}
                    </FacturasList>
                </Cobradas>
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
    display: grid;
    grid-template-columns:1fr 1fr;
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
    height: 35px;
    font-size: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 20px;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    position: relative;
`
const Fecha = styled.div`
    margin-right:10px;
`
const Monto = styled.div`
    text-align:right;
    margin-right:5px;
`
const Pendientes = styled.div`
`
const Cobradas = styled.div`
`
const IconFacturas = styled(AttachMoney)`
    color: ${props => (props.active) ? '#1c88e6' : 'gray'};
    width: ${props => (props.active) ? '38px' : '40px'};
    margin: 10px;
`
const Estado = styled.div`
    --id:Estado;
    padding-top: 3px;
    border-radius: 50%;
    height: 20px;
    background: #3d83ec;
    color: white;
    text-align: center;
    font-weight: bold;
`