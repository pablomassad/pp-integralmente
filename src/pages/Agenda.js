import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import {PersonPin} from '@styled-icons/material-rounded/PersonPin'

import {useHistory} from 'react-router-dom'

import anonymous from '../assets/images/anonymous.png'
import {useDispatch, useSelector} from 'react-redux'
import {bl, ui, fb} from '../redux'
import moment from 'moment'

import {confirmAlert} from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

export default function Agenda()
{
    console.log('render AGENDA...................................................')
    const history = useHistory()
    const dispatch = useDispatch()
    const [criteria, setCriteria] = useState('')
    const userInfo = useSelector(st => st.fb.userInfo)
    const allPatients = useSelector(st => st.fb.allPatients)

    const data = allPatients
        .filter((f) => criteria.length < 2 || Object.keys(f).some((k) => `${f[k]}`.toLowerCase().includes(criteria.toLowerCase())))
        .sort((f1, f2) =>
        {
            const d1 = f1['apellido']
            const d2 = f2['apellido']
            if (typeof d1 === 'number') {
                return d1 - d2;
            }
            const s1 = `${d1}`;
            const s2 = `${d2}`;
            return s1.localeCompare(s2);
        });
    const evalEdad = (nac) =>
    {
        const today = moment()
        if (!nac) return '0 años'
        const cumple = moment(nac)
        const edad = today.diff(cumple, 'y')
        return edad + " años"
    }

    useEffect(() =>
    {
        dispatch(ui.setTitle('Agenda'))
        if (userInfo) dispatch(bl.getAllPatients())
        else history.replace('/')
    }, [])

    return (
        <PatientsFrame>
            <PatientFilter>
                <IconPerson />
                <Criteria
                    type="text"
                    placeholder="Ingrese datos paciente"
                    value={criteria}
                    onChange={e => setCriteria(e.target.value)}
                />
                <Total>
                    Total: {data.length}
                </Total>
            </PatientFilter>
            <PatientList>
                {data.map((p, i) =>
                    <PatientCard key={i} onClick={() => dispatch(bl.clonePatient(p))}>
                        <PatientData>
                            <PatientPic src={p.foto === 'assets/images/anonymous.png' ? anonymous : p.foto} />
                            <PatientInfo>
                                <Title>
                                    {p.apellido}, {p.nombres}
                                </Title>
                                <Description>
                                    {evalEdad(p.nacimiento)}, {p.obrasocial}
                                </Description>
                                <ProfGrid>
                                    {p.uPhotos.map((photo, i) =>
                                        <Professional key={i} src={photo} />
                                    )}
                                </ProfGrid>
                            </PatientInfo>
                        </PatientData>
                    </PatientCard>
                )}
            </PatientList>
        </PatientsFrame>
    )
}

const PatientsFrame = styled.div`
	background: #eee;
	height: 100%;
`
const PatientFilter = styled.div`
    --id:PatientFilter;
    background:#ccc;
    display:grid;
    grid-template-columns:50px 1fr 75px;
    align-items:center;
    box-shadow: 0 1px 3px black;
`
const IconPerson = styled(PersonPin)`
    color: gray;
    width: 40px;
    margin: 10px;
`
const Total = styled.div`
	font-weight: bold;
	color: black;
`
const Criteria = styled.input`
	--name: 'Criteria';
	padding: 0 10px;
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

	/* @media screen and (min-width: 500px) {
        width:400px;
    }  */
`
const PatientCard = styled.div`
	--id: PatientCard;
	position: relative;
	background: #ccc;
	color: gray;
	box-shadow: 1px 1px 3px black;
	padding: 10px;
	margin: 5px;
	border-radius: 5px;
`
const PatientData = styled.div`
	display: grid;
	grid-template-columns: 1fr 5fr;
	align-items: center;
`
const PatientPic = styled.img`
	border-radius: 50%;
	width: 12vw;
	height: 12vw;
    object-fit: cover;
	box-shadow: 1px 1px 3px black;
`
const ProfGrid = styled.div`
    display:grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
	align-items: center;
`
const Professional = styled.img`
	border-radius: 50%;
	width: 30px;
	height: 30px;
    object-fit: cover;
	box-shadow: 1px 1px 3px black;
`
const PatientInfo = styled.div`
	--id: PatientInfo;
	padding-left: 10px;
`
const PatientList = styled.div`
	--id: PatientList;
	overflow: auto;
	height: calc(100vh - 114px);
	margin-top: 3px;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
	align-items: center;
`
const Title = styled.div`font-size: 20px;`
const Description = styled.div`font-size: 15px;`
