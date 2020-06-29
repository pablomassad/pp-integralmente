import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import {IconRemove} from '../../global-styles'
import {PersonPin} from '@styled-icons/material-rounded/PersonPin'
import GlassButton from '../../common/GlassButton'

import {useHistory} from 'react-router-dom'

import anonymous from '../../assets/images/anonymous.png'
import {useDispatch, useSelector} from 'react-redux'
import {bl, ui, fb} from '../../redux'
import moment from 'moment'

import {confirmAlert} from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

// import SwipeableListItem from "../../common/SwipeableList/SwipeableListItem";
// import SwipeableList from "../../common/SwipeableList/SwipeableList";
// const background = <span>Archive</span>;
// const fakeContent = (
//     <div className="FakeContent">
//         <span>Swipe to delete</span>
//     </div>
// );
// < SwipeableList background = {background} >
//     <SwipeableListItem>{fakeContent}</SwipeableListItem>
//     <SwipeableListItem>{fakeContent}</SwipeableListItem>
//     <SwipeableListItem>{fakeContent}</SwipeableListItem>
//     <SwipeableListItem>{fakeContent}</SwipeableListItem>
//     <SwipeableListItem>{fakeContent}</SwipeableListItem>
// </SwipeableList >


export default function Pacientes()
{
    const history = useHistory()
    const dispatch = useDispatch()

    const userInfo = useSelector(st => st.fb.userInfo)
    const patients = useSelector(st => st.fb.allPatients.filter(x => x.uids[userInfo.id]))

    const [criteria, setCriteria] = useState('')

    const data = patients
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
    const removePatient = (e, p) =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar paciente',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removePatient(p, userInfo.id))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }
    const gotoPatient = (patient) =>
    {
        dispatch(fb.setPatient(patient))
        history.push(`/patient`)
        // history.push(`/patient/${patient.id}`)
    }

    useEffect(() =>
    {
        dispatch(ui.setTitle('Pacientes'))
        if (userInfo) {
            dispatch(fb.setPatient(null))
        }
    }, [userInfo, dispatch, history])


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
                {data.map((p, i) => (
                    <PatientCard key={i} onClick={() => gotoPatient(p)}>
                        <PatientData>
                            <PatientPic src={p.foto || anonymous} />
                            <PatientInfo>
                                <Title>{p.apellido}, {p.nombres}</Title>
                                <Description>{evalEdad(p.nacimiento)}, {p.obrasocial}</Description>
                                <p>{p.uids[userInfo.id].atencion}</p>
                            </PatientInfo>
                        </PatientData>
                        <IconRemove onClick={(e) => removePatient(e, p)} />
                    </PatientCard>
                ))}
                <GlassButton
                    fixed
                    right={5}
                    bottom={5}
                    width={50}
                    height={50}
                    radius={50}
                    onClick={() => gotoPatient(
                        {
                            id: 0,
                            uids: {
                                [userInfo.id]: {
                                    photoURL: userInfo.photoURL,
                                    atencion: '',
                                    diagnostico: ''
                                }
                            }
                        })}>
                    <IconAdd>+</IconAdd>
                </GlassButton>
            </PatientList>
        </PatientsFrame>
    )
}

const PatientsFrame = styled.div`
    background:#eee;
    height:100%;
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
    width: 35px;
    margin: 10px;
`
const Total = styled.div`
	font-weight: bold;
	color: black;
`
const Criteria = styled.input`
    --name: 'Criteria';
    padding: 0px 10px;
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
    --id:PatientCard;
    position:relative;
    background: #ccc;
    color: gray;
    box-shadow: 1px 1px 3px black;
    padding: 10px;
    margin: 5px;
    border-radius: 5px;
`
const PatientData = styled.div`
    display:grid;
    grid-template-columns: 1fr 5fr;
    align-items:center;
`
const PatientPic = styled.img`
    border-radius:50%;
    width:12vw;
    height:12vw;
    object-fit: cover;
    box-shadow:1px 1px 3px black;
`
const PatientInfo = styled.div`
    --id:PatientInfo;
    padding-left:10px;
`
const PatientList = styled.div`
    --id:PatientList;
    overflow:auto;
    margin-top: 3px;
    display: grid;
    grid-template-columns:repeat(auto-fill, minmax(360px, 1fr));
    align-items:center;
    /* height: calc(100vh - 110px); */
    position:relative;
`
const Title = styled.div`
    font-size:20px;
`
const Description = styled.div`
    font-size:15px;
`
const IconAdd = styled.div`
	font-size: 24px;
	font-weight: bold;
`
