import React, {useState, useEffect} from 'react'
import styled, {keyframes} from 'styled-components'

import GlassButton from '../common/GlassButton'
import anonymous from '../assets/images/anonymous.png'

import {useDispatch, useSelector} from 'react-redux'
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
    const userInfo = useSelector(st => st.fb.userInfo)
    const db = useSelector(st => st.fb.distribution)
    const users = useSelector(st => st.fb.users)
    const [showSelector, setShowSelector] = useState(false)
    const [cell, setCell] = useState()
    const [anim, setAnim] = useState('popin')

    const data = db
    // .map(s =>
    // {
    //     const usr = users.find(u => u.id === s.uid)
    //     const o = {...s, displayName: usr.displayName, photo: usr.photoURL}
    //     return o
    // })


    const openSelector = (e, id, t, i) =>
    {
        if (userInfo.isAdmin) {
            // console.log(e.clientX + ':' + e.clientY)
            // setCoords({x:e.clientX, y:e.clientY})
            setAnim('popout')
            setShowSelector(true)
            setCell({
                dayId: id,
                turn: t,
                room: i
            })
        }
    }
    const selectUserHandle = (usr) =>
    {
        setAnim('popout')
        data[cell.dayId][cell.turn][cell.room] = (usr) ? {name: usr.displayName, photo: usr.photoURL} : ""

        dispatch(bl.updateDistribution(data))
        setShowSelector(false)
    }

    useEffect(() =>
    {
        console.log('call getOcuppation')
        dispatch(bl.getDistribution())
        dispatch(ui.setTitle('Ocupación'))
    }, [dispatch])

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
            {data.map((d, id) =>
                (
                    <DayFrame key={id}>
                        <Day>
                            {d.day}
                        </Day>
                        <RoomsFrame>
                            {d.M.map((mod, i) => (
                                <Module key={i}>
                                    {mod ?
                                        <GlassButton height={50} margin={5} background={'#0688de'} onClick={(e) => openSelector(e, id, 'M', i)}>
                                            <ProfFrame>
                                                <ProfPhoto src={mod.photo || anonymous} />
                                                <Name>{mod.name}</Name>
                                            </ProfFrame>
                                        </GlassButton>
                                        :
                                        <GlassButton height={50} margin={5} background={'#fff'} onClick={(e) => openSelector(e, id, 'M', i)} empty>
                                            <p></p>
                                        </GlassButton>}
                                </Module>
                            ))}
                            {d.T.map((mod, i) => (
                                <Module key={i}>
                                    {mod ?
                                        <GlassButton height={50} margin={5} background={'#2da91f'} onClick={(e) => openSelector(e, id, 'T', i)}>
                                            <ProfFrame>
                                                <ProfPhoto src={mod.photo || anonymous} />
                                                <Name>{mod.name}</Name>
                                            </ProfFrame>
                                        </GlassButton>
                                        :
                                        <GlassButton height={50} margin={5} background={'#fff'} onClick={(e) => openSelector(e, id, 'T', i)} empty>
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
                    <DisabledPanel onClick={()=>setShowSelector(false)}/>{anim}
                    <Selector animation={anim}>
                        <GlassButton onClick={(e) => selectUserHandle()}>
                            Disponible
                        </GlassButton>
                        {users.map((u, i) =>
                            <User key={i} onClick={(e) => selectUserHandle(u)}>
                                <Avatar src={u.photoURL || anonymous} />
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
    max-width: 500px;
    height: 92vh;
    margin: auto;
    overflow-y: scroll;
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
    height:60px;
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

// const popin = keyframes`
//     from {
//         transform: scale(.1); 
//     }
//     to {
//         transform: scale(1);
//     }
// `
// const popout = keyframes`
//     from {
//         transform: scale(1);
//     }
//     to {
//         transform: scale(0);
//     }
// `
const zoomINOUT = (props) =>
{
    console.log('props-', props)
    return keyframes`
    from {
        transform: scale(props); 
    }
    to {
        transform: scale(props*100);
    }
    `
}
const Selector = styled.div`
    --id:Selector;
    /* animation:  ${props => (props.animation)}  .6s linear; */
    animation:  ${zoomINOUT}  .6s linear;
    overflow:hidden;
    overflow-y:auto;
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
const ProfFrame = styled.div`
    display:grid;
    grid-template-columns:50px 1fr;
    align-items:center;
`
const Name = styled.div`
    --id:Name;
    font-size:2.3vw;
    text-align:center;
    @media screen and (min-width: 550px) {
        font-size:.8rem;
    } 
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

