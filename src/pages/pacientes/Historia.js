import React from 'react'
import styled from 'styled-components'

import {useSelector} from 'react-redux'

export default function Historia(){
    console.log('....[Historia]')

    const selPatient = useSelector(st => st.fb.selPatient)

    return (
        <Frame>
            Historia
        </Frame>
    )
}

const Frame = styled.div`
`