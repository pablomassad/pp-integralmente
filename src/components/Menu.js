import React from 'react'
import styled from 'styled-components'
import {PersonPin} from '@styled-icons/material-rounded/PersonPin'
import {AttachMoney} from '@styled-icons/material-rounded/AttachMoney'
import {Gear} from '@styled-icons/octicons/Gear'

import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {ui} from '../redux'

export default function Menu()
{
    const history = useHistory()
    const dispatch = useDispatch()
    const sidebarFlag = useSelector(st => st.ui.sidebarFlag)

    const onToggleHandle = () =>
    {
        dispatch(ui.toggleSidebar())
    }
    const goto = (page) =>
    {
        history.replace(page)
        dispatch(ui.toggleSidebar())
    }

    return (
        <MenuFrame>
            <ToggleButton onClick={onToggleHandle}>
                &#8801;
            </ToggleButton>
            <MenuItems className={(sidebarFlag) ? "sidebar sbOpen" : "sidebar sbClose"}>
                <MenuItem onClick={() => goto('/patients')}>
                    <IconPatients />
                        Pacientes
                    </MenuItem>
                <MenuItem onClick={() => goto('/bills')} >
                    <IconBills />
                        Facturación
                    </MenuItem>
                <MenuItem onClick={() => goto('/options')} >
                    <IconOptions />
                        Configuración
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
    font-size: 50px;
    background: transparent;
    border: none;
`
const MenuFrame = styled.div`
`
const MenuItems = styled.div`
    --id:MenuItems;
`
const IconPatients = styled(PersonPin)`
    width:30px;
    color:gray;
`
const IconBills = styled(AttachMoney)`
    width:35px;
    color:gray;
`
const IconOptions = styled(Gear)`
    width:25px;
    color:gray;
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
