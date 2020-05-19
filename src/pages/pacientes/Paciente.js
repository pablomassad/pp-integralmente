import React, {useState} from "react"
import styled from "styled-components"

import {PersonPin} from "@styled-icons/material-outlined/PersonPin"
import {History} from "@styled-icons/material-sharp/History"
import {TextDocument} from "@styled-icons/entypo/TextDocument"

import Ficha from "./Ficha"
import Historia from "./Historia"
import Documentacion from "./Documentacion"

export default function Paciente()
{
   console.log("....[Paciente]")

   const [selTool, setSelTool] = useState("ficha")

   return (
      <PatientFrame>
         <Toolbar>
            <Tool
               onClick={() => setSelTool("ficha")}
               active={selTool === "ficha"}>
               <IconFicha active={selTool === "ficha"} />
					Ficha
				</Tool>
            <Tool
               onClick={() => setSelTool("historia")}
               active={selTool === "historia"}>
               <IconHistoria active={selTool === "historia"} />
					Historia
				</Tool>
            <Tool
               onClick={() => setSelTool("documentacion")}
               active={selTool === "documentacion"}>
               <IconDocumentacion active={selTool === "documentacion"} />
					Documentación
				</Tool>
         </Toolbar>
         {selTool === "ficha" && <Ficha />}
         {selTool === "historia" && <Historia />}
         {selTool === "documentacion" && <Documentacion />}
      </PatientFrame>
   )
}

const PatientFrame = styled.div`background: #ddd;`
const Toolbar = styled.div`
	--id: Toolbar;
	background: #ddd;
	font-size: 11px;
	color: #555;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	-webkit-align-items: center;
	-webkit-box-align: center;
	-ms-flex-align: center;
	-webkit-align-items: center;
	-webkit-box-align: center;
	-ms-flex-align: center;
	align-items: center;
	justify-items: center;
	box-shadow: 0px 1px 3px black;
	margin: 0 0 5px 0;
`
const Tool = styled.div`
	--id: Tool;
	width: 100%;
	border-radius: 10px;
	display: grid;
	justify-items: center;
	grid-template-rows: 1fr 20px;
	background: ${props =>
   {
      return props.active ? "#ccc" : "transparent"
   }};
	box-shadow: ${props => (props.active ? "inset 2px 2px 3px #444" : "none")};
	transform: scale(.9) translateY(1px) translateX(1px);
`

const IconFicha = styled(PersonPin)`
    color: ${props => (props.active ? "#1c88e6" : "gray")};
    width: ${props => (props.active ? "38px" : "40px")};
    margin: 10px;
`
const IconHistoria = styled(History)`
    color: ${props => (props.active ? "#1c88e6" : "gray")};
    width: ${props => (props.active ? "38px" : "40px")};
    margin: 10px;
`
const IconDocumentacion = styled(TextDocument)`
    color: ${props => (props.active ? "#1c88e6" : "gray")};
    width: ${props => (props.active ? "38px" : "40px")};
    margin: 10px;
`