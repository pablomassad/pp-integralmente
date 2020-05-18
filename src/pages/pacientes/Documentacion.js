import React from 'react'
import styled from 'styled-components'

import {useSelector} from 'react-redux'

export default function Documentacion(){

    console.log('....[Documentacion]')

    const selPatient = useSelector(st => st.fb.selPatient)

    return (
        <Frame>
            Documentacion
        </Frame>
    )
}

const Frame = styled.div`
`