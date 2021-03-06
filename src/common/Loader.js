import React from 'react'
import styled, {keyframes} from 'styled-components'
import logo from '../assets/images/p&pSoft.png'

import {useSelector} from "react-redux";

export default function Loader() 
{
    const overlay = useSelector(state => state.ui.loading)

    const styled = (overlay) ? {
        position: 'fixed',
        height: '100vh',
        left: '0', right: '0', top: '0', bottom: '0',
        backgroundColor: 'rgba(25,25,25,0.7)',
        zIndex: '9999',
        paddingTop: '250px',
        textAlign: 'center'
    } : null

    if (!overlay)
        return null

    return (
        <div style={styled}>
            <Spinner src={logo} />
        </div>
    )
}

// const rotate = keyframes`
//     from {
//         transform: rotateY(0deg);
//     }
//     to {
//         transform: rotateY(360deg);
//     }
// `

const heart = keyframes`
    from {
        transform: scale(1);
    }
    to {
        transform: scale(.8);
    }
`
const Spinner = styled.img`
    --id:Spinner;
    animation: ${heart} 1s linear infinite;
    width: 200px;
`