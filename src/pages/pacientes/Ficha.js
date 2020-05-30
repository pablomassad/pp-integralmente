import React, {useState, useRef} from 'react'
import styled from 'styled-components'
import {useForm} from 'react-hook-form'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl, ui} from '../../redux'

import moment from 'moment'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {registerLocale, setDefaultLocale} from "react-datepicker";
import es from 'date-fns/locale/es';

import GlassButton from '../../common/GlassButton'


export default function Ficha()
{
    const dispatch = useDispatch()
    const history = useHistory()

    const origPatient = useSelector(st=>st.fb.selPatient)
    const [fileInfo, setFileInfo] = useState()
    const inputFile = useRef()

    const [selPatient, setSelPatient] = useState(origPatient)

    console.log('....[Ficha]', selPatient)


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
        const newPat = {...selPatient, [field]: value, dirty: true}
        setSelPatient(newPat)
    }
    const choosePic = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        inputFile.current.click()
    }
    const onChangePic = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        console.log('file: ', e.target.files[0])
        setFileInfo(e.target.files[0])
    }    
    const cancelChanges = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()
        // setSelPatient(null)
        history.replace('/patients')
    }
    const acceptChanges = async () =>
    {
        if (fileInfo) {
            if (selPatient.foto) {
                //    await dispatch(bl.deleteFileStorage('pacientes', selPatient.foto))
                console.log('nombre existente: ', selPatient.foto)
            }
            const url = await dispatch(bl.uploadFileStorage('pacientes', fileInfo))
            selPatient.foto = url
        }
        console.log('updated Patient: ', selPatient)
        const res = await dispatch(bl.updatePatient(selPatient))
        if (res) {
            dispatch(ui.showMessage({msg: 'Paciente guardado', type: 'success'}))
            setFileInfo(undefined)
            // setSelPatient(null)
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar los datos del paciente', type: 'error'}))
        }
    }

    if (!selPatient) return null

    return (
        <Form>
            <input type="file" ref={inputFile} style={{display: 'none'}} onChange={onChangePic} />
            <Main>
                <Avatar src={selPatient.foto} onClick={choosePic}>
                </Avatar>
                <FullName>
                    <UserInput type="text" placeholder="Ingrese nombres" value={selPatient.nombres || ''} name="nombres" onChange={e => updateSelPatient('nombres', e.target.value)}/>
                    <UserInput type="text" placeholder="Ingrese apellido" value={selPatient.apellido || ''} name="apellido" onChange={e => updateSelPatient('apellido', e.target.value)}/>
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
                <UserInput type="number" placeholder="Nro" value={selPatient.afiliado || ''} name="nro" onChange={e => updateSelPatient('nro', e.target.value)} />
                <UserInput type="text" placeholder="Diagnóstico" value={selPatient.diagnostico || ''} name="diagnostico" onChange={e => updateSelPatient('diagnostico', e.target.value)} />
                <UserInput type="text" placeholder="Días de atención" value={selPatient.atencion || ''} name="atencion" onChange={e => updateSelPatient('atencion', e.target.value)} />

            </Row>
            <Contacto>
                <UserInput type="text" placeholder="Nombre madre" value={selPatient.madre || ''} name="madre" onChange={e => updateSelPatient('madre', e.target.value)}/>
                <UserInput type="text" placeholder="Nombre padre" value={selPatient.padre || ''} name="padre" onChange={e => updateSelPatient('padre', e.target.value)}/>
                <UserInput type="text" placeholder="Tel. madre" value={selPatient.telmadre || ''} name="telmadre" onChange={e => updateSelPatient('telmadre', e.target.value)} />
                <UserInput type="number" placeholder="Tel. padre" value={selPatient.telpadre || ''} name="telpadre" onChange={e => updateSelPatient('telpadre', e.target.value)}/>
                <UserInput type="text" placeholder="Correo electrónico" value={selPatient.email || ''} name="email" onChange={e => updateSelPatient('email', e.target.value)}/>
                <UserInput type="text" placeholder="Domicilio" value={selPatient.domicilio || ''} name="domicilio"onChange={e => updateSelPatient('domicilio', e.target.value)} />
                <UserInput type="text" placeholder="Ciudad" value={selPatient.ciudad || ''} name="ciudad" onChange={e => updateSelPatient('ciudad', e.target.value)}/>
            </Contacto>
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
    text-align:center
`
const Row = styled.div`
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
    align-items:center;
`
const Contacto = styled.div`
    background: lightgray;
    border-radius: 10px;
    box-shadow: 1px 1px 3px black;
    margin: 10px;
    padding: 10px 0;
`
const Actions = styled.div`
    display:grid;
    grid-template-columns:1fr 1fr 1fr;
`
