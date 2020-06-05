import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import GlassButton from '../common/GlassButton'

import {useDispatch, useSelector, shallowEqual} from 'react-redux'
import {bl, ui} from '../redux'


export default function Ocupacion()
{
    // const db = {
    //     Lunes: {
    //         M: ['', '', ''],
    //         T: ['', '', '']
    //     },
    //     Martes: {
    //         M: ['', '', ''],
    //         T: ['Bianca', 'Sofía', 'Bernarda']
    //     },
    //     Miércoles: {
    //         M: ['', '', 'Gabriela'],
    //         T: ['', '', '']
    //     },
    //     Jueves: {
    //         M: ['', '', ''],
    //         T: ['', 'Silvina', '']
    //     },
    //     Viernes: {
    //         M: ['', '', 'Gabriela'],
    //         T: ['', 'Silvina', '']
    //     },
    //     Sábado: {
    //         M: ['Asociación', '', ''],
    //         T: ['', '', '']
    //     }
    // }

    const dispatch = useDispatch()
    const db = useSelector(st => st.fb.occupation)
    const users = useSelector(st => st.fb.users)
    const [showSelector, setShowSelector] = useState(false)
    const [cell, setCell] = useState()
    // const [data, setData] = useState()

    const data = {...db}

    const openSelector = (d, t, i) =>
    {
        setShowSelector(true)
        setCell({
            day: d,
            turn: t,
            room: i
        })
    }
    const selectUserHandle = (u) =>
    {
        data[cell.day][cell.turn][cell.room] = (u) ? u : ""
        const newData = {...data}
        // setData(newData)
        dispatch(bl.updateOccupation(newData))
        setShowSelector(false)
    }

    useEffect(() =>
    {
        dispatch(bl.getOccupation())
    }, [])

    if (!data) return null

    console.log('data:', data)
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
                                        <GlassButton margin={5} background={'#0688de'} onClick={(e) => openSelector(d, 'M', i)}>
                                            <ProfPhoto src={prof.photoURL} />
                                            <Name>{prof.displayName}</Name>
                                        </GlassButton>
                                        :
                                        <GlassButton margin={5} background={'#fff'} onClick={(e) => openSelector(d, 'M', i)} empty>
                                            <p></p>
                                        </GlassButton>}
                                </Module>
                            ))}
                            {data && data[d].T.map((prof, i) => (
                                <Module key={i}>
                                    {prof ?
                                        <GlassButton margin={5} background={'#2da91f'} onClick={(e) => openSelector(d, 'T', i)}>
                                            <ProfPhoto src={prof.photoURL} />
                                            <Name>{prof.displayName}</Name>
                                        </GlassButton>
                                        :
                                        <GlassButton margin={5} background={'#fff'} onClick={(e) => openSelector(d, 'T', i)} empty>
                                            <p></p>
                                        </GlassButton>}
                                </Module>
                            ))}
                        </RoomsFrame>
                    </DayFrame>
                ))
            }
            {showSelector ?
                <div>
                    <DisabledPanel />
                    <Selector>
                        <GlassButton onClick={(e) => selectUserHandle()}>
                            Disponible
                        </GlassButton>
                        {users.map((u, i) =>
                            <User key={i} onClick={(e) => selectUserHandle(u)}>
                                <Avatar src={u.photoURL} />
                                <Name>{u.displayName}</Name>
                            </User>
                        )}
                    </Selector>
                </div>
                :
                <div></div>}
        </WeekFrame >
    )
}

const WeekFrame = styled.div`
    --id: WeekFrame;
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
    box-shadow:inset 1px 1px 3px;
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
const DisabledPanel = styled.div`
    --id:DisabledPanel;
    position:absolute;
    top: 0;
    left: 0;
    width:100vw;
    height:100vh;
    background:black;
    opacity:.4;
`
const Selector = styled.div`
    --id:Selector;
    position:absolute;
    background:lightgray;
    border-radius:10px;
    padding:10px;
    top:0;
    right:0;
    bottom:0;
    left:0;
    margin:auto;
    width: 200px;
    height: 400px;
    box-shadow: 2px 2px 10px;    
`
const User = styled.div`
display: grid;
    grid-template-columns: 60px 1fr;
    align-items: center;
    background: white;
    height: 50px;
    margin: 10px 0px;
    border-radius: 5px;
    box-shadow: 1px 1px 3px;
    padding: 10px;
`
const Name = styled.div`
    font-size:14px;
    text-align:center;
`
const Avatar = styled.img`
	overflow: hidden;
	border-radius: 50%;
    top: 0px;
    right: 0px;
	width: 50px;
	height: 50px;
    object-fit: cover;
    margin:auto;
	box-shadow: 1px 1px 5px black;
`
const ProfPhoto = styled.img`
	overflow: hidden;
	border-radius: 50%;
    top: 0px;
    right: 0px;
	width: 40px;
	height: 40px;
    object-fit: cover;
    margin:auto;
	box-shadow: 1px 1px 5px black;
`