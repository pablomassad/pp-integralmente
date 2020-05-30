import React from 'react'
import styled from 'styled-components'
import GlassButton from '../../common/GlassButton'


export default function Ocupacion()
{
    const data = {
        Lunes: {
            M: ['', '', ''],
            T: ['', 'Sofia', '']
        },
        Martes: {
            M: ['Silvina', '', ''],
            T: ['Sofia', '', '']
        },
        Miércoles: {
            M: ['Silvina', '', ''],
            T: ['', 'Sofia', '']
        },
        Jueves: {
            M: ['', '', 'Bernarda'],
            T: ['', 'Sofia', '']
        },
        Viernes: {
            M: ['Silvina', '', ''],
            T: ['', 'Sofia', '']
        },
        Sábado: {
            M: ['', '', ''],
            T: ['', 'Sofia', 'Bernarda']
        }
    }
    console.log(data)

    return (
        <WeekFrame>
            <DayFrame>
                <div></div>
                <RoomsFrame background={'transparent'}>
                    <Room>Consultorio 1</Room>
                    <Room>Consultorio 2</Room>
                    <Room>Consultorio 3</Room>
                </RoomsFrame>
            </DayFrame>
            {Object.keys(data).map((d, i) =>
                (
                    <DayFrame key={i}>
                        <Day>
                            {d}
                        </Day>
                        <RoomsFrame>
                            {data[d].M.map((prof, i) => (
                                <Module key={i}>
                                    {prof ?
                                        <GlassButton margin={5} background={'#0688de'}>
                                            {prof}
                                        </GlassButton>
                                        :
                                        <div></div>}
                                </Module>
                            ))}
                            {data[d].T.map((prof, i) => (
                                <Module key={i}>
                                    {prof ?
                                        <GlassButton margin={5} background={'#287c9c'}>
                                            {prof}
                                        </GlassButton>
                                        :
                                        <div></div>}
                                </Module>
                            ))}
                        </RoomsFrame>
                    </DayFrame>
                ))
            }
        </WeekFrame >
    )
}

// <GlassButton margin={2} background={'purple'}>
//     {prof}
// </GlassButton>


const WeekFrame = styled.div`
    --id: WeekFrame;
    margin: 10px 5px;
    padding: 5px;
`
const DayFrame = styled.div`
    --id:DayFrame;
    background: white;
    margin: 5px;
    padding: 5px;
    display:grid;
    grid-template-columns:25px 1fr ;
    align-items:center;
    border-radius:3px;
    box-shadow:1px 1px 2px gray;
`
const Day = styled.div`
    /* position: relative;
    top: 50%;
    left: 50%; */
    transform: rotate(-90deg) translate(-15px, -3px);
`
const RoomsFrame = styled.div`
    --id:RoomsFrame;
    background:${props => (props.background) ? props.background : 'linear-gradient(0,#fff4e9,#ebfbff)'};
    display:grid;
    grid-template-columns:1fr 1fr 1fr ;
    align-items:center;
    text-align:center;
`
const Room = styled.div`
`
const Module = styled.div`
    --id:Module;
    height:40px;
    border:1px solid lightgray;
`