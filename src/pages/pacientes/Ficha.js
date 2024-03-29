import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import {PhoneCall} from '@styled-icons/boxicons-solid/PhoneCall'
import {Mail} from '@styled-icons/entypo/Mail'

import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl, fb, ui} from '../../redux'
import anonymous from '../../assets/images/anonymous.png'

import moment from 'moment'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import GlassButton from '../../common/GlassButton'
import FileUploader from '../../components/FileUploader'


export default function Ficha()
{
    const dispatch = useDispatch()
    const history = useHistory()

    const userInfo = useSelector(st => st.fb.userInfo)
    const origPatient = useSelector(st => st.fb.selPatient)
    const [fileInfo, setFileInfo] = useState()

    const [selPatient, setSelPatient] = useState(origPatient)

    const evalEdad = (nac) =>
    {
        const today = moment()
        if (!nac) return '0 años'
        const cumple = moment(nac)
        const edad = today.diff(cumple, 'y')
        return edad + " años"
    }
    const updateSelPatient = (field, value) =>
    {
        dispatch(ui.setDirty(true))
        //const newPat = {...selPatient, [field]: value}
        const newPat = {...selPatient}
        newPat[field] = value
        setSelPatient(newPat)
    }
    const updateUserSelPatient = (field, value) =>
    {
        dispatch(ui.setDirty(true))
        const newPat = {...selPatient}
        newPat.uids[userInfo.id][field] = value
        setSelPatient(newPat)
    }
    const onFileHandle = (obj) =>
    {
        setFileInfo(obj)
    }
    const phoneTo = (field) =>
    {
        window.open('tel:' + field);
    }
    const cancelChanges = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()
        dispatch(ui.setDirty(false))
        setSelPatient(null)
        history.push('/patients')
    }
    const acceptChanges = async (e) =>
    {
        e.preventDefault()
        // if (selPatient.id === 0){
        //     selPatient.uids[userInfo.id].photoURL = userInfo.photoURL
        // }

        const pat = await dispatch(bl.updatePatient(selPatient))
        if (selPatient) {
            if (fileInfo) {
                dispatch(ui.showLoader(true))
                if (selPatient.foto) {
                    console.log('nombre existente: ', selPatient.foto)
                    await dispatch(bl.deleteFileStorage(selPatient.id, selPatient.foto))
                }
                const url = await dispatch(bl.uploadFileStorage(pat.id, fileInfo.file))
                selPatient.foto = url
                dispatch(ui.showLoader(false))
            }
            await dispatch(fb.setPatient(pat))
            console.log('updated Patient: ', selPatient)
            await dispatch(bl.updatePatient(selPatient))
            dispatch(ui.showMessage({msg: 'Paciente guardado', type: 'success'}))
            setFileInfo(undefined)
            await dispatch(bl.getAllPatients())
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar los datos del paciente', type: 'error'}))
        }
    }

    useEffect(() =>
    {
        if (origPatient.id === 0)
            dispatch(ui.setDirty(true))
    }, [dispatch, origPatient])

    if (!selPatient) return null

    return (
        <Form>
            <Main>
                <FileUploader onFileSelected={onFileHandle} compressImage>
                    <Avatar src={(fileInfo && fileInfo.dataUrl) || selPatient.foto || anonymous} >
                    </Avatar>
                </FileUploader>
                <FullName>
                    <UserInput type="text" placeholder="Ingrese nombres" value={selPatient.nombres || ''} name="nombres" onChange={e => updateSelPatient('nombres', e.target.value)} />
                    <UserInput type="text" placeholder="Ingrese apellido" value={selPatient.apellido || ''} name="apellido" onChange={e => updateSelPatient('apellido', e.target.value)} />
                </FullName>
            </Main>
            <Row>
                <DatePicker
                    placeholderText="Nacimiento"
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                    selected={selPatient.nacimiento}
                    onChange={e => updateSelPatient('nacimiento', e != null ? e.getTime() : null)}
                    className="customDatePicker"
                    showYearDropdown
                    dateFormatCalendar="MMMM"
                    yearDropdownItemNumber={15}
                    scrollableYearDropdown
                // locale="es"
                // dateFormat="MM/yyyy"
                // showMonthYearPicker
                // showFullMonthYearPicker
                />
                <Edad><strong>Edad:</strong>{evalEdad(selPatient.nacimiento)}</Edad>
                <UserInput type="text" placeholder="Colegio" value={selPatient.colegio || ''} name="colegio" onChange={e => updateSelPatient('colegio', e.target.value)} />
                <UserInput type="text" placeholder="Curso" value={selPatient.curso || ''} name="curso" onChange={e => updateSelPatient('curso', e.target.value)} />
                <UserInput type="number" placeholder="DNI" value={selPatient.dni || ''} name="dni" onChange={e => updateSelPatient('dni', e.target.value)} />
                <UserInput type="text" placeholder="Obra social" value={selPatient.obrasocial || ''} name="obrasocial" onChange={e => updateSelPatient('obrasocial', e.target.value)} />
                <UserInput type="number" placeholder="Nro.Afiliado" value={selPatient.afiliado || ''} name="afiliado" onChange={e => updateSelPatient('afiliado', e.target.value)} />
                <UserInput type="text" placeholder="Diagnóstico" value={selPatient.uids[userInfo.id].diagnostico || ''} name="diagnostico" onChange={e => updateUserSelPatient(`diagnostico`, e.target.value)} />
                <DatePicker
                    placeholderText="Inicio Trat."
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                    selected={selPatient.inicio}
                    onChange={e => updateSelPatient('inicio', e != null ? e.getTime() : null)}
                    className="customDatePicker"
                    showYearDropdown
                    dateFormatCalendar="MMMM"
                    yearDropdownItemNumber={15}
                    scrollableYearDropdown
                // locale="es"
                // dateFormat="MM/yyyy"
                // showMonthYearPicker
                // showFullMonthYearPicker
                />
                <DatePicker
                    placeholderText="Fin Trat."
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                    selected={selPatient.fin}
                    onChange={e => updateSelPatient('fin', e != null ? e.getTime() : null)}
                    className="customDatePicker"
                    showYearDropdown
                    dateFormatCalendar="MMMM"
                    yearDropdownItemNumber={15}
                    scrollableYearDropdown
                // locale="es"
                // dateFormat="MM/yyyy"
                // showMonthYearPicker
                // showFullMonthYearPicker
                />
                <UserInput type="text" placeholder="Días de atención" value={selPatient.uids[userInfo.id].atencion || ''} name="atencion" onChange={e => updateUserSelPatient(`atencion`, e.target.value)} />
            </Row>
            <Contacto>
                <Field>Madre</Field>
                <UserInput type="text" placeholder="Nombre madre" value={selPatient.madre || ''} name="madre" onChange={e => updateSelPatient('madre', e.target.value)} />

                <Field>Tel.Madre</Field>
                <IconInput>
                    <UserInput type="text" placeholder="Tel. madre" value={selPatient.telmadre || ''} name="telmadre" onChange={e => updateSelPatient('telmadre', e.target.value)} />
                    <IconTel onClick={() => phoneTo(selPatient.telmadre)} />
                </IconInput>

                <Field>Padre</Field>
                <UserInput type="text" placeholder="Nombre padre" value={selPatient.padre || ''} name="padre" onChange={e => updateSelPatient('padre', e.target.value)} />

                <Field>Tel.Padre</Field>
                <IconInput>
                    <UserInput type="number" placeholder="Tel. padre" value={selPatient.telpadre || ''} name="telpadre" onChange={e => updateSelPatient('telpadre', e.target.value)} />
                    <IconTel onClick={() => phoneTo(selPatient.telpadre)} />
                </IconInput>

                <Field>Correo</Field>
                <IconInput>
                    <UserInput type="text" placeholder="Correo electrónico" value={selPatient.email || ''} name="email" onChange={e => updateSelPatient('email', e.target.value)} />
                    <a href={"mailto:" + selPatient.email}>
                        <IconMail />
                    </a>
                </IconInput>

                <Field>Domicilio</Field>
                <UserInput type="text" placeholder="Domicilio" value={selPatient.domicilio || ''} name="domicilio" onChange={e => updateSelPatient('domicilio', e.target.value)} />

                <Field>Ciudad</Field>
                <UserInput type="text" placeholder="Ciudad" value={selPatient.ciudad || ''} name="ciudad" onChange={e => updateSelPatient('ciudad', e.target.value)} />
            </Contacto>
            <Actions>
                <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                <div></div>
                <GlassButton onClick={e => acceptChanges(e)}>Aceptar</GlassButton>
            </Actions>
        </Form>
    )
}

const Form = styled.form`
    background:#ddd;
    overflow:auto;
    height: calc(100vh - 135px);
`
const Main = styled.div`
    background:#ddd;
    display:grid;
    grid-template-columns:90px 1fr;
    align-items:center;
`
const FullName = styled.div`
`
const Avatar = styled.img`
    margin-left: 10px;
    justify-self:center;
    overflow:hidden;
    border-radius:50%;
    width:85px;
    height: 85px;
    box-shadow:1px 1px 3px black;
    object-fit: cover;
`
const IconInput = styled.div`
    position:relative;
`
const IconTel = styled(PhoneCall)`
    position:absolute;
    right:10%;
    top:18px;
    width:30px;
    color:#2687ce;
`
const IconMail = styled(Mail)`
    position:absolute;
    right:10%;
    top:18px;
    width:30px;
    color:#2687ce;
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
const Edad = styled.div`
    text-align:center;
`
const Row = styled.div`
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
    align-items:center;
`
const Contacto = styled.div`
    display:grid;
    grid-template-columns:50px 1fr;
    align-items: center;
    background: lightgray;
    border-radius: 10px;
    box-shadow: 1px 1px 3px black;
    margin: 10px;
    padding: 10px 0 10px 10px;
`
const Field = styled.div`
    font-weight:bold;
`
const Actions = styled.div`
    display:grid;
    grid-template-columns:1fr 1fr 1fr;
`
