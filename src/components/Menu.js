import React from 'react'
import styled from 'styled-components'

import { PersonPin } from '@styled-icons/material-rounded/PersonPin'
import { AttachMoney } from '@styled-icons/material-rounded/AttachMoney'
import { PersonAdd } from '@styled-icons/material/PersonAdd'
import { Chat } from '@styled-icons/material/Chat'
import { Calendar } from '@styled-icons/evil/Calendar'
import { Feedback } from '@styled-icons/material/Feedback'
import { Cake } from '@styled-icons/entypo/Cake'
import { Exit } from '@styled-icons/icomoon/Exit'

import anonymous from '../assets/images/anonymous.png'

import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ui, bl } from '../redux'

export default function Menu() {
    const history = useHistory()
    const dispatch = useDispatch()
    const userInfo = useSelector(st => st.fb.userInfo)
    const sidebarFlag = useSelector(st => st.ui.sidebarFlag)

    const onToggleHandle = () => {
        dispatch(ui.toggleSidebar())
    }
    const goto = (page) => {
        history.push(page)
        dispatch(ui.toggleSidebar())
    }

    return (
        <MenuFrame>
            <ToggleButton onClick={onToggleHandle}>
                &#8801;
            </ToggleButton>
            <MenuItems className={(sidebarFlag) ? "sidebar sbOpen" : "sidebar sbClose"}>
                <MenuItem onClick={() => goto('/profile')}>
                    <Avatar src={userInfo.photoURL || anonymous} />
                    {userInfo.displayName}
                </MenuItem>
                <hr />
                <MenuItem onClick={() => goto('/patients')}>
                    <IconPatients />
                    Pacientes
                </MenuItem>
                <MenuItem onClick={() => goto('/bills')} >
                    <IconBills />
                    Facturación
                </MenuItem>
                <MenuItem onClick={() => goto('/agenda')} >
                    <IconAgenda />
                    Agenda
                </MenuItem>
                <MenuItem onClick={() => goto('/news')} >
                    <IconChat />
                    Comunicados
                </MenuItem>
                <MenuItem onClick={() => goto('/occupation')} >
                    <IconOcupation />
                    Ocupación
                </MenuItem>
                <MenuItem onClick={() => dispatch(bl.evalBirthdays())} >
                    <IconBirthday />
                    Cumples
                </MenuItem>
                <MenuItem onClick={() => goto('/feedback')} >
                    <IconFeedback />
                    Mejoras
                </MenuItem>
                <hr />
                <MenuItem onClick={() => goto('/signIn')} >
                    <IconExit />
                    Salir
                </MenuItem>
            </MenuItems>
        </MenuFrame>
    )
}

const ToggleButton = styled.div`
    --id:ToggleButton;
    margin: -8px 5px;
    cursor: pointer;
    color: gray;
    font-size: 40px;
    background: transparent;
    border: none;
`
const Avatar = styled.img`
	overflow: hidden;
	border-radius: 50%;
    margin-left:-20px;
	width: 50px;
	height: 50px;
    object-fit: cover;
	box-shadow: 1px 1px 3px black;
`
const MenuFrame = styled.div`
`
const MenuItems = styled.div`
    --id:MenuItems;
`
const IconPatients = styled(PersonPin)`
    width:30px;
    color:gray;
    justify-self:center;
`
const IconBills = styled(AttachMoney)`
    width:35px;
    color:gray;
    justify-self:center;
`
const IconAgenda = styled(PersonAdd)`
    width:25px;
    color:gray;
    justify-self:center;
`
const IconChat = styled(Chat)`
    width:25px;
    color:gray;
    justify-self:center;
`
const IconOcupation = styled(Calendar)`
    width:35px;
    color:gray;
    justify-self:center;
`
const IconFeedback = styled(Feedback)`
    width:35px;
    color:gray;
    justify-self:center;
`
const IconBirthday = styled(Cake)`
    width:35px;
    color:gray;
    justify-self:center;
`

const IconExit = styled(Exit)`
    width:35px;
    color:gray;
    justify-self:center;
`

const MenuItem = styled.div`
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
    cursor: pointer;
    margin:5px;
    padding:10px;
    color:gray;
    text-shadow: none;
    transition: all .15s ease-in;

    &:hover{
        transform: scale(1.2) translateY(-2px) translateX(10px);
        text-shadow:1px 1px 1px lightgray;
    }
`
