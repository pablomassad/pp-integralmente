import React, {useState} from 'react'
import styled from 'styled-components'
import GlassButton from '../common/GlassButton'


export default function Ocupacion()
{
    const db = {
        Lunes: {
            M: ['', '', ''],
            T: ['', '', '']
        },
        Martes: {
            M: ['', '', ''],
            T: ['Bianca', 'Sofía', 'Bernarda']
        },
        Miércoles: {
            M: ['', '', 'Gabriela'],
            T: ['', '', '']
        },
        Jueves: {
            M: ['', '', ''],
            T: ['', 'Silvina', '']
        },
        Viernes: {
            M: ['', '', 'Gabriela'],
            T: ['', 'Silvina', '']
        },
        Sábado: {
            M: ['Asociación', '', ''],
            T: ['', '', '']
        }
    }

    const [data, setData] = useState(db)

    const selectorHandle = (d, t, i) =>
    {
        // mostrar modal con profesionales disponibles
        const prof = data[d][t][i]
        if (prof !== "")
            data[d][t][i] = ""
        else
            data[d][t][i] = "Pablo"

        const newData = {...data}
        setData(newData)
        //save occupation to DB 

    }

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
                                        <GlassButton margin={5} background={'#0688de'} onClick={(e) => selectorHandle(d, 'M', i)}>
                                            {prof}
                                        </GlassButton>
                                        :
                                        <GlassButton margin={5} background={'#fff'} onClick={(e) => selectorHandle(d, 'M', i)} noShadow>
                                            <p></p>
                                        </GlassButton>}
                                </Module>
                            ))}
                            {data[d].T.map((prof, i) => (
                                <Module key={i}>
                                    {prof ?
                                        <GlassButton margin={5} background={'#2da91f'} onClick={(e) => selectorHandle(d, 'T', i)}>
                                            {prof}
                                        </GlassButton>
                                        :
                                        <GlassButton margin={5} background={'#fff'} onClick={(e) => selectorHandle(d, 'T', i)} noShadow>
                                            <p></p>
                                        </GlassButton>}
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
    background:${props => (props.background) ? props.background : '#eee'};
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
    border:1px solid #888;
`