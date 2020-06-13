import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'

import {BackInTime} from '@styled-icons/entypo/BackInTime'
import {Trash} from '@styled-icons/heroicons-outline/Trash'

import GlassButton from '../common/GlassButton'
import anonymous from '../assets/images/anonymous.png'

import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector, shallowEqual} from 'react-redux'
import {bl, ui} from '../redux'

import moment from 'moment'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {registerLocale, setDefaultLocale} from 'react-datepicker'
import es from 'date-fns/locale/es'

import {confirmAlert} from 'react-confirm-alert' // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css


export default function Comunicados()
{
    console.log('......[Comunicados]')
    const dispatch = useDispatch()
    const history = useHistory()
    const dirty = useSelector(st=>st.ui.dirty)
    const news = useSelector(st => st.fb.allNews)
    const userInfo = useSelector(st => st.fb.userInfo)
    const users = useSelector(st => st.fb.users)

    const newsList = useRef()

    const [criteria, setCriteria] = useState('')
    const [selNews, setSelNews] = useState(null)


    const data = news
        // .map(s=>{
        //     const usr = users.find(u=>u.id === s.uid)
        //     console.log('usuario:', usr)
        //     const o = {...s, displayName:usr.displayName, photo:usr.photoURL}
        //     return o
        // })
        .filter((s) => criteria.length < 3 || Object.keys(s).some((k) => `${s[k]}`.toLowerCase().includes(criteria.toLowerCase())))
        .map((s) => selNews?.id === s.id ? selNews : s);

    const dataAndNew = (selNews?.id === 0 ? [selNews] : []).concat(data)

    const removeNewsHandle = e =>
    {
        e.stopPropagation()
        e.preventDefault()

        confirmAlert({
            title: 'Borrar comunicado',
            message: 'Esta seguro?',
            buttons: [
                {
                    label: 'Si',
                    onClick: () => dispatch(bl.removeNews(selNews.id))
                },
                {
                    label: 'No',
                    onClick: () => console.log('cancel')
                }
            ]
        })
    }
    const onSelNews = (e, s) =>
    {
        if (s.uid === userInfo.id) {
            e.preventDefault()
            if (dirty) return // Comunicado en edicion

            const news = {...s}
            console.log('onSelNews', news)
            setSelNews(news)
        }
        else {
            dispatch(ui.showMessage({msg: 'Unicamente el autor del comunicado puede editarlo!', type: 'info'}))
        }
    }
    const updateNews = (field, value) =>
    {
        dispatch(ui.setDirty(true))
        const news = {...selNews, [field]: value}
        setSelNews(news)
    }
    const addNewsHandle = () =>
    {
        dispatch(ui.setDirty(true))
        const news = {id: 0, uid: userInfo.id, displayName: userInfo.displayName, photo: userInfo.photoURL}
        setSelNews(news)
        newsList.current.scrollTo(0, 0) //newsList.current.scrollHeight+1000)
    }
    const cancelChanges = e =>
    {
        setSelNews(null)
        dispatch(ui.setDirty(false))
        history.goBack()
    }
    const acceptChanges = async () =>
    {
        console.log('updated News: ', selNews)
        const res = await dispatch(bl.updateNews(selNews))
        if (res) {
            dispatch(ui.showMessage({msg: 'Comunicado guardado', type: 'success'}))
            setSelNews(null)
            history.goBack()
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar el comunicado', type: 'error'}))
        }
    }

    useEffect(() =>
    {
        dispatch(ui.setTitle('Comunicados'))
        dispatch(bl.updateNewsRead())
    }, [])

    return (
        <NewsFrame>
            <NewsFilter>
                <IconNews />
                <Criteria
                    type="text"
                    placeholder="Ingrese filtro"
                    value={criteria}
                    onChange={e => setCriteria(e.target.value)}
                />
            </NewsFilter>
            <NewsHeader>
                <div>Total de Comunicados:{data.length}</div>
            </NewsHeader>
            <NewsList ref={newsList}>
                {dataAndNew.map((s, i) =>
                    <div key={i} >
                        {(s.id !== selNews?.id)
                            ? <NewsCard onClick={e => onSelNews(e, s)}>
                                <NewsInfo>
                                    <Label>Fecha:</Label>
                                    {moment(s.fecha).format('DD/MM/YY HH:mm')}
                                    <Label>Autor:</Label>
                                    <Label>{s.displayName}</Label>
                                </NewsInfo>
                                <Observaciones>
                                    {s.description}
                                </Observaciones>
                                <Avatar src={s.photo || anonymous} />
                            </NewsCard>
                            : <NewsForm>
                                <DatePicker
                                    placeholderText="Fecha comunicado"
                                    dateFormat="dd-MM-yyyy"
                                    maxDate={new Date()}
                                    selected={selNews.fecha}
                                    onChange={e => updateNews('fecha', e != null ? new Date().getTime() : null)}
                                    className="customDatePicker"
                                />
                                {selNews.id !== 0 ? (
                                    <GlassButton height={40} width={40} onClick={e => removeNewsHandle(e, s)}>
                                        <IconDelete />
                                    </GlassButton>)
                                    : <div></div>}
                                <ObsArea
                                    type="text"
                                    placeholder="Descripcion del comunicado"
                                    value={selNews.description || ''}
                                    name="description"
                                    onChange={e => updateNews('description', e.target.value)}
                                />
                                <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                                <GlassButton onClick={acceptChanges}>Aceptar</GlassButton>
                            </NewsForm>
                        }
                    </div>
                )}
            </NewsList>
            {dirty
                ? null
                : <GlassButton
                    absolute
                    right={5}
                    bottom={5}
                    width={50}
                    height={50}
                    radius={50}
                    onClick={addNewsHandle}>
                    <IconAdd>+</IconAdd>
                </GlassButton>}
        </NewsFrame>
    )
}

const NewsFrame = styled.div`
	background: #fff;
	height: 100%;
    max-width:500px;
    margin:auto;
`
const NewsFilter = styled.div`
	--id: NewsFilter;
	background: #ccc;
	display: grid;
    grid-template-columns: 70px 1fr;
	align-items: center;
	box-shadow: 0 1px 3px black;
`
const Criteria = styled.input`
	--name: 'Criteria';
	font-size: 15px;
	color: #444;
	background: white;
	border-radius: 5px;
	width: 80%;
	height: 35px;
	border: none;
	display: block;
	margin: 10px 0;
	text-align: center;
	box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}

	/* @media screen and (min-width: 500px) {
        width:400px;
    }  */
`
const Label = styled.div`
	font-weight: bold;
	float: left;
`
const Avatar = styled.img`
    position:absolute;
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
const NewsHeader = styled.div`
	--id:NewsHeader;
	margin: 5px;
	font-size: 19px;
	color: black;
	display: grid;
	grid-template-columns: 1fr;
	align-items: center;
`
const NewsList = styled.div`
    --id:NewsList;
    background:#aaa;
	overflow: auto;
	height: calc(100vh - 150px);
`
const NewsCard = styled.div`
    --id:NewsCard;
    background: #abd1dc;
    padding: 8px 8px;
    border-radius: 5px;
    margin: 7px;
    box-shadow: 1px 1px 2px black;
    font-size: 14px;
    position: relative;
`
const NewsForm = styled.div`
    --id: NewsForm;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 10px;
    background: lightgray;
    margin: 20px 7px;
    box-shadow: inset 2px 2px 5px #555;
    border-radius: 5px;
`
const NewsInfo = styled.div`
    --id:NewsInfo;
    padding: 0 5px;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 70px 1fr;
`
const Observaciones = styled.div`
	--id: Observaciones;
    padding: 8px;
    text-align: justify;
    border-radius: 5px;
    border: 1px solid black;
    box-shadow: inset 1px 1px 3px black;
    background: white;
`
const ObsArea = styled.textarea`
--name: ObsArea;
    grid-column: 1 / 3;
    padding: 5px 10px;
    font-size: 14px;
    color: #444;
    background: white;
    border-radius: 5px;
    width: 90%;
    height: 65px;
    border: none;
    margin: 10px auto;
    text-align: justify;
    box-shadow: inset 2px 2px 5px grey;

	&:hover {
		background-color: rgb(220, 230, 240);
	}

	&:focus {
		outline: none;
		/* box-shadow: 0px 0px 3px 0px rgb(111, 168, 201); */
	}
`
const Alert = styled.div`
    --id: Alert;
    background: gray;
    box-shadow: inset 1px 1px;
    border-radius: 5px;
    width: 30px;
    height: 30px;
    justify-self: end;
    margin-top: -18px;
`
const IconAdd = styled.div`
	font-size: 24px;
	font-weight: bold;
`

const IconNews = styled(BackInTime)`
    color: ${props => (props.active ? '#1c88e6' : 'gray')};
    width: ${props => (props.active ? '38px' : '40px')};
    margin: 10px;
`
const IconDelete = styled(Trash)`
    width:25px;
    color: white;
`
