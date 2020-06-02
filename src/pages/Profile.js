import React, {useState, useRef} from 'react'
import styled from 'styled-components'
import {User} from '@styled-icons/fa-solid/User'
import {UserGraduate} from '@styled-icons/fa-solid/UserGraduate'

import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {ui, bl} from '../redux'

import moment from 'moment'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {registerLocale, setDefaultLocale} from "react-datepicker";
import es from 'date-fns/locale/es';

import GlassButton from '../common/GlassButton'


export default function Profile()
{
    const history = useHistory()
    const dispatch = useDispatch()
    const userInfo = useSelector(st => st.fb.userInfo)
    const [selUser, setSelUser] = useState(userInfo)
    const [fileInfo, setFileInfo] = useState()
    const inputFile = useRef()

    const evalEdad = (nac) =>
    {
        const today = moment()
        if (!nac) return '0 años'
        const cumple = moment(nac)
        const edad = today.diff(cumple, 'y')
        return edad + " años"
    }

    const updateSelUser = (field, val) =>
    {
        const newData = {...selUser, [field]:val}
        setSelUser(newData)
    }

    const changeRoleHandle = isAdmin =>
    {
        const newData = {...selUser, isAdmin:isAdmin}
        setSelUser(newData)
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

        setFileInfo(e.target.files[0])
        var reader = new FileReader();
        reader.onload = (e) => selUser.foto = e.target.result
        reader.readAsDataURL(e.target.files[0])
    }
    const resetPassword = (e)=>{
        dispatch(bl.sendResetEmail(selUser.email))
    }
    const cancelChanges = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()
        history.goBack() //('/patients')
    }
    const acceptChanges = async (e) =>
    {
        e.preventDefault()
        const usr = await dispatch(bl.saveFirebaseUserInfo(selUser))
        if (usr) {
            if (fileInfo) {
                if (selUser.photoURL) {
                    //    await dispatch(bl.deleteFileStorage('pacientes', selPatient.foto))
                    console.log('nombre existente: ', selUser.photoURL)
                }
                const url = await dispatch(bl.uploadFileStorage('avatars', fileInfo)) // res.id
                selUser.photoURL = url
                await dispatch(bl.saveFirebaseUserInfo(selUser))
            }
            console.log('updated User: ', selUser)
            dispatch(ui.showMessage({msg: 'Usuario guardado', type: 'success'}))
            setFileInfo(undefined)
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar los datos del paciente', type: 'error'}))
        }
    }

    return (
        <UserFrame>
            <input type="file" ref={inputFile} style={{display: 'none'}} onChange={onChangePic} />
            <Avatar src={selUser.photoURL} onClick={choosePic}>
            </Avatar>
            <div>
                <FieldDescription>
                    Nombre de usuario:
                </FieldDescription>
                <UserInput type="text" placeholder="Ingrese nombres" value={selUser.displayName || ''} name="displayName" onChange={e => updateSelUser('displayName', e.target.value)} />
            </div>

            <RoleFrame>
                <IconUser on={selUser.isAdmin !== true} name="usuario" onClick={e=>changeRoleHandle(false)}/>
                <IconAdmin on={selUser.isAdmin === true} name="admin" onClick={e=>changeRoleHandle(true)}/>
            </RoleFrame>

            <BirthdayFrame>
                <FieldDescription>
                    Fecha de nacimiento
                    </FieldDescription>
                <DatePicker
                    placeholderText="Fecha de nacimiento"
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                    selected={selUser.birthday}
                    onChange={e => updateSelUser('birthday', e != null ? e.getTime() : null)}
                    className="customDatePicker"
                    showYearDropdown
                    dateFormatCalendar="MMMM"
                    yearDropdownItemNumber={15}
                    scrollableYearDropdown style={{margin: '5px 0 !important'}}
                />
            </BirthdayFrame>

            <GlassButton onClick={resetPassword}>Olvidé contraseña</GlassButton>
            <Edad><strong>Edad: </strong>{evalEdad(selUser.birthday)}</Edad>

            <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
            <GlassButton onClick={e => acceptChanges(e)}>Aceptar</GlassButton>
        </UserFrame>
    )
}


const UserFrame = styled.div`
    background:lightgray;
    margin:10px;
    box-shadow:1px 1px 3px;
    border-radius:10px;
    padding:10px;
    display:grid;
    grid-template-columns:1fr 1fr;
    align-items:center;
`
const Avatar = styled.img`
	overflow: hidden;
	border-radius: 50%;
	width: 200px;
	height: 200px;
    margin:auto;
	box-shadow: 1px 1px 5px black;
`
const FieldDescription = styled.div`
    font-weight:bold;
    font-size:15px;
    text-align:center;
`
const UserInput = styled.input`
	--id: 'UserInput';
    text-align: center;
    padding: 5px 10px;
    font-size: 15px;
    color: #444;
    background: white;
    border-radius: 5px;
    width: 80%;
    height: 35px;
    border: none;
    display: block;
    margin: 5px auto;
    box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}
`
const RoleFrame = styled.div`
    --id:RoleFrame;
    margin: auto;
    display: grid;
    justify-items: center;
    grid-template-columns: 50px 50px;
    align-items:center;
`
const Edad = styled.div`
    margin:5px 0;
    text-align: center;
`
const BirthdayFrame = styled.div`
    --id:BirthdayFrame;
    text-align:center;
`
const IconUser = styled(User)`
    cursor:pointer;
    width:${props => (props.on) ? '25px' : '25px'};
    opacity: ${props => (props.on) ? 1 : .5};
    color: ${props => (props.on) ? '#3181d6' : 'black'};
    box-shadow: ${props => (props.on) ?'inset 1px 1px 3px black': '1px 1px 3px black'};
    padding: 10px;
    border-radius: 9px 0 0 9px;
`
const IconAdmin = styled(UserGraduate)`
    cursor:pointer;
    width:${props => (props.on) ? '25px' : '25px'};
    opacity: ${props => (props.on) ? 1 : .5};
    color: ${props => (props.on) ? '#3181d6' : 'gray'};
    box-shadow: ${props => (props.on) ?'inset 1px 1px 3px black': '1px 1px 3px black'};
    padding: 10px;
    border-radius: 0 9px 9px 0;
`
