import React from 'react'
import styled from 'styled-components'
import Modulo from './Modulo'


export default function Ocupacion()
{
    const days = [
        "Lun",
        "Mar",
        "Mie",
        "Jue",
        "Vie",
        "Sab"
    ]
    const ocupationData = [
        {
            room: 1, weekday: [
                {morning: '', afternoon: ''},
                {morning: 'Helena', afternoon: ''},
                {morning: '', afternoon: ''},
                {morning: 'Helena', afternoon: ''},
                {morning: '', afternoon: 'Marcela'},
                {morning: '', afternoon: ''}
            ]
        },
        {
            room: 2, weekday: [
                {morning: '', afternoon: ''},
                {morning: '', afternoon: 'Sofia De Gerardo'},
                {morning: 'Marcela', afternoon: ''},
                {morning: '', afternoon: 'Silvina Melguin'},
                {morning: '', afternoon: 'Silvina Melguin'},
                {morning: '', afternoon: ''}
            ]
        },
        {
            room: 3, weekday: [
                {morning: 'Paula', afternoon: ''},
                {morning: '', afternoon: ''},
                {morning: '', afternoon: 'Gabriela Bettocini'},
                {morning: 'Paula', afternoon: ''},
                {morning: '', afternoon: 'Gabriela Bettocini'},
                {morning: '', afternoon: ''}
            ]
        }
    ]
    return (
        <WeekFrame>
            {ocupationData.map((c, i) =>
                (
                    <>
                        <Room>c.room</Room>
                        <div key={i}>
                            {c.weekday.map((d, i) => (
                                <>
                                    <Day>
                                        days[i]
                                    </Day>
                                    <Morning>
                                        <Modulo prof={d.morning}/>
                                    </Morning>
                                    <Afternoon>
                                        <Modulo prof={d.afternoon}/>
                                    </Afternoon>
                                </>
                            ))}
                        </div>
                    </>
                ))
            }
        </WeekFrame>
    )
}

const WeekFrame = styled.div`
    display:grid;
    grid-template-columns:1fr 1fr 1fr;
    align-items:center;
`
const Room = styled.div`
    background:lightgreen;
`
const Day = styled.div`
    background:lightblue;
`
const Morning = styled.div`
    background:lightyellow;
`
const Afternoon = styled.div`
    background:lightgoldenrodyellow
`