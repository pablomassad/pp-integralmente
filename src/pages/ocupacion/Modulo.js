import React from 'react'
import styled from 'styled-components'


export default function Modulo({prof}){

    return (
        <ModuleFrame>
            {prof}
        </ModuleFrame>
    )
}

const ModuleFrame = styled.div`
    border-radius:4px;
    box-shadow:1px 1px 1px gray;
    background:'lightred'

`