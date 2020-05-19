import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import {useForm} from 'react-hook-form'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {bl} from '../../redux'

import moment from 'moment'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {registerLocale, setDefaultLocale} from "react-datepicker";
import es from 'date-fns/locale/es';

import GlassButton from '../../common/GlassButton'
// registerLocale('es', es)

export default function Ficha()
{
   console.log('....[Ficha]')
   const dispatch = useDispatch()
   const history = useHistory()
   const inputFile = useRef(null)
   const {register, handleSubmit, errors} = useForm()
   const selPatient = useSelector(st => st.fb.selPatient)

   const onSubmit = (data) =>
   {
      console.log(data)
      dispatch(bl.updatePatient(data))
   }
   const evalEdad = () =>
   {
      const today = moment()
      if (!selPatient) selPatient.edad = "0 años"
      const cumple = moment(selPatient.nacimiento)
      const edad = today.diff(cumple, 'y')
      selPatient.edad = edad + " años"
   }
   const onCumpleHandle = (date) =>
   {
      selPatient.nacimiento = date
      evalEdad()
   }
   const onChangeFile = (e) =>
   {
      e.stopPropagation()
      e.preventDefault()
      const fn = e.target.files[0].name
      // dispatch(db.updateWidgetInfo({url: fn}))
      // setFileData(e.target.files[0])
   }
   const choosePicture = (e) =>
   {
      // Mobile
      // this.fileInfo = await this.chooser.getFile('*/*') //this.fbsSrv.convertToFile(await this.chooser.getFile('*/*'))
      // this.foto = this.fbsSrv.onFileSelected(this.fileInfo)


      // Browser
      inputFile.current.click()
      // const fileInfo = e.target.files[0]
      // selPatient.foto = this.fbsSrv.onFileSelected(this.fileInfo)
   }
   const cancelInfo = () =>
   {
      history.replace('/patients')
   }


   useEffect(() =>
   {
      if (!selPatient) return
      evalEdad()
   }, [selPatient])

   if (!selPatient) return null

   return (
      <Form onSubmit={handleSubmit(onSubmit)}>
         <input type='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFile} />
         <Main>
            <Avatar src={selPatient.foto} onClick={choosePicture}>
            </Avatar>
            <FullName>
               <UserInput type="text" placeholder="Ingrese nombres" defaultValue={selPatient.nombres} name="nombres"
                  ref={register({required: "*"})} />
               <UserInput type="text" placeholder="Ingrese apellido" defaultValue={selPatient.apellido} name="apellido"
                  ref={register({required: "*", minlength: {value: 6, message: "Cantidad minima de 3 letras"}})} />
            </FullName>
         </Main>
         <Row>
            <DatePicker
               placeholderText="Nacimiento"
               dateFormat="dd/MMM/yyyy"
               maxDate={new Date()}
               // locale="es"
               selected={selPatient.nacimiento}
               onChange={onCumpleHandle}
               className="customDatePicker"
               showYearDropdown
               dateFormatCalendar="MMMM"
               yearDropdownItemNumber={15}
               scrollableYearDropdown
               // dateFormat="MM/yyyy"
               // showMonthYearPicker
               // showFullMonthYearPicker
               ref={register}
            />
            <Edad><strong>Edad:</strong>{selPatient.edad}</Edad>
            <UserInput type="text" placeholder="Colegio" defaultValue={selPatient.colegio} name="colegio" ref={register} />
            <UserInput type="text" placeholder="Curso" defaultValue={selPatient.curso} name="curso" ref={register} />
            <UserInput type="number" placeholder="DNI" defaultValue={selPatient.dni} name="dni" ref={register} />
            <UserInput type="text" placeholder="Obra social" defaultValue={selPatient.obrasocial} name="obrasocial" ref={register} />
            <UserInput type="number" placeholder="Nro" defaultValue={selPatient.afiliado} name="nro" ref={register} />
            <UserInput type="text" placeholder="Diagnóstico" defaultValue={selPatient.diagnostico} name="diagnostico" ref={register} />
            <UserInput type="text" placeholder="Días de atención" defaultValue={selPatient.atencion} name="atencion" ref={register} />

         </Row>
         <Contacto>
            <UserInput type="text" placeholder="Nombre madre" defaultValue={selPatient.madre} name="madre" ref={register} />
            <UserInput type="text" placeholder="Nombre padre" defaultValue={selPatient.padre} name="padre" ref={register} />
            <UserInput type="text" placeholder="Tel. madre" defaultValue={selPatient.telmadre} name="telmadre" ref={register} />
            <UserInput type="number" placeholder="Tel. padre" defaultValue={selPatient.telpadre} name="telpadre" ref={register} />
            <UserInput type="text" placeholder="Correo electrónico" defaultValue={selPatient.email} name="email" ref={register} />
            <UserInput type="text" placeholder="Domicilio" defaultValue={selPatient.domicilio} name="domicilio" ref={register} />
            <UserInput type="text" placeholder="Ciudad" defaultValue={selPatient.ciudad} name="ciudad" ref={register} />
         </Contacto>
         <Actions>
            <GlassButton onClick={cancelInfo}>Cancelar</GlassButton>
            <div></div>
            <GlassButton>Aceptar</GlassButton>
         </Actions>
         {errors.Names && <p>{errors.Names.message}</p>}
         {errors.LastName && <p>{errors.LastName.message}</p>}
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
