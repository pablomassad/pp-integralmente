import React from 'react'
import styled from 'styled-components'

import {useSelector} from 'react-redux'

export default function Facturas(){

    console.log('....[Facturas]')

    const selPatient = useSelector(st => st.fb.selPatient)

    return (
        <Frame>
            Facturas
        </Frame>
    )
}

const Frame = styled.div`
`