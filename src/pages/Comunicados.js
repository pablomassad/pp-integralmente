import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'

import {BackInTime} from '@styled-icons/entypo/BackInTime'
import {File} from '@styled-icons/boxicons-regular/File'
import {Trash} from '@styled-icons/heroicons-outline/Trash'

import GlassButton from '../common/GlassButton'
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
    const history = useHistory()
    const dispatch = useDispatch()

    const news = useSelector(st => st.fb.allNews)

    const [fileInfo, setFileInfo] = useState()
    const newsList = useRef()

    const [criteria, setCriteria] = useState('')
    const [selNews, setSelNews] = useState(null)

    const data = news
        .filter((s) => criteria.length < 3 || Object.keys(s).some((k) => `${s[k]}`.toLowerCase().includes(criteria.toLowerCase())))
        .map((s) => selNews?.id === s.id ? selNews : s)
        .sort((f1, f2) =>
        {
            const d1 = f1['fecha']
            const d2 = f2['fecha']
            if (typeof d1 === 'number') {
                return d2 - d1;
            }
            const s1 = `${d1}`;
            const s2 = `${d2}`;
            return s2.localeCompare(s1);
        });

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
        e.preventDefault()
        if (selNews?.dirty) return // Factura en edicion

        const News = {...s}
        console.log('onSelNews', news)
        setSelNews(news)
    }
    const updateNews = (field, value) =>
    {
        const news = {...selNews, [field]: value, dirty: true}
        setSelNews(news)
        dispatch(bl.getAllNews())
    }
    const addNewsHandle = () =>
    {
        const news = {id: 0, dirty: true}
        setSelNews(news)
        newsList.current.scrollTo(0, 0) //newsList.current.scrollHeight+1000)
    }
    const cancelChanges = e =>
    {
        e.stopPropagation()
        e.preventDefault()
        setSelNews(null)
    }
    const acceptChanges = async () =>
    {
        // if (fileInfo) {
        //     if (selNews.nombre) {
        //         //    await dispatch(bl.deleteFileStorage('news', selFactura.nombre))
        //         console.log('nombre existente: ', selNews.nombre)
        //     }

        //     const url = await dispatch(bl.uploadFileStorage('news', fileInfo))
        //     selNews.url = url
        //     selNews.nombre = fileInfo.name
        // }
        console.log('updated News: ', selNews)
        const res = await dispatch(bl.updateNews(selNews))
        if (res) {
            dispatch(ui.showMessage({msg: 'Comunicado guardado', type: 'success'}))
            setFileInfo(undefined)
            setSelNews(null)
        } else {
            dispatch(ui.showMessage({msg: 'No se ha podido guardar el comunicado', type: 'error'}))
        }
    }


    useEffect(() =>
    {
        dispatch(bl.getAllNews())
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
                                    {moment(s.fecha).format('DD/MM/YY')}
                                    <Label>Comunicado:</Label>
                                </NewsInfo>
                                <Observaciones>
                                    {s.descripcion}
                                </Observaciones>
                            </NewsCard>
                            : <NewsForm>
                                <DatePicker
                                    placeholderText="Fecha comunicado"
                                    dateFormat="dd-MM-yyyy"
                                    maxDate={new Date()}
                                    selected={selNews.fecha}
                                    onChange={e => updateNews('fecha', e != null ? e.getTime() : null)}
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
                                    value={selNews.descripcion || ''}
                                    name="descripcion"
                                    onChange={e => updateNews('descripcion', e.target.value)}
                                />
                                <GlassButton onClick={cancelChanges}>Cancelar</GlassButton>
                                <GlassButton onClick={acceptChanges}>Aceptar</GlassButton>
                            </NewsForm>
                        }
                    </div>
                )}
            </NewsList>
            {selNews?.dirty
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
    background:white;
	overflow: auto;
	height: calc(100vh - 150px);
`
const NewsCard = styled.div`
    --id:NewsCard;
    background: #c1c0c0;
    padding: 8px 8px;
    border-radius: 5px;
    margin: 7px;
    box-shadow: 1px 1px 2px black;
    font-size: 12px;
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
    padding: 0 5px;
    display: grid;
    grid-template-columns: 90px 1fr;
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
const IconView = styled(File)`
    width: 25px;
    color: white;
`
const IconDelete = styled(Trash)`
    width:25px;
    color: white;
`