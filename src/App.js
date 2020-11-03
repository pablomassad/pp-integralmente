import React, {useState, useEffect, lazy, Suspense} from 'react'
import styled from 'styled-components'
import logo from './assets/images/integralmenteET.png'
import anonymous from './assets/images/anonymous.png'

import {useHistory} from 'react-router-dom'
import {Switch, Route} from 'react-router-dom'
import {useToasts} from 'react-toast-notifications'
import {useDispatch, useSelector, shallowEqual} from 'react-redux'
import {bl} from './redux'

const Menu = lazy(()=>import("./components/Menu"))
const Loader = lazy(()=>import("./common/Loader"))

const SignUp = lazy(()=>import("./pages/SignUp"))
const SignIn = lazy(()=>import("./pages/SignIn"))
const Profile = lazy(()=>import("./pages/Profile"))
const PasswordReset = lazy(()=>import("./pages/PasswordReset"))
const Ficha = lazy(()=>import("./pages/pacientes/Ficha"))
const Paciente = lazy(()=>import("./pages/pacientes/Paciente"))
const Pacientes = lazy(()=>import("./pages/pacientes/Pacientes"))
const Facturas = lazy(()=>import("./pages/Facturas"))
const Estadisticas = lazy(()=>import("./pages/Estadisticas"))
const Opciones = lazy(()=>import("./pages/Opciones"))
const Agenda = lazy(()=>import("./pages/Agenda"))
const Comunicados = lazy(()=>import("./pages/Comunicados"))
const Ocupacion = lazy(()=>import("./pages/Ocupacion"))
const Feedback = lazy(()=>import("./pages/Feedback"))


export default function App()
{
    console.log('APP render.............')

    const {addToast} = useToasts()
    const history = useHistory()
    const dispatch = useDispatch()
    const msgInfo = useSelector(st => st.ui.msgInfo)
    const currentTitle = useSelector(st => st.ui.currentTitle)
    const userInfo = useSelector(st => st.fb.userInfo)
    const allNews = useSelector(st => st.fb.allNews, shallowEqual)
    const [newsCounter, setNewsCounter] = useState(0)


    const newsHandle = (e) =>
    {
        history.push('/news')
    }

    const redirect = React.useCallback(() => 
    {
        console.log('redirect........')
        history.replace('/')
    },[history])

    useEffect(() =>
    {
        console.log('setNewsCounter......')
        if (userInfo != null && userInfo) {
            const cnt = allNews.filter(a => a.fecha > userInfo.lastNewsRead).length
            console.log('COUNTER: ', cnt)
            setNewsCounter(cnt)
        }
    }, [allNews, userInfo])

    useEffect(
        () =>
        {
            if (msgInfo) addToast(msgInfo.msg, {
                appearance: msgInfo.type, 
                autoDismiss: true, 
                autoDismissTimeout:3000, 
                transitionDuration:500,
                placement:'bottom-center' })
        },
        [msgInfo, addToast]
    )

    useEffect(() =>
    {
        dispatch(bl.getUsers())
        dispatch(bl.getAllNews())
        dispatch(bl.getAllPatients())
        if (userInfo === null){
            redirect()
        }
    }, [dispatch, redirect, userInfo])

    return (
        <Suspense fallback={<div>cargando....</div>}>
            {userInfo
                ? <Navbar>
                    <Menu />
                    <Logo src={logo} />
                    <Title>{currentTitle}</Title>
                    <Avatar src={userInfo.photoURL || anonymous} onClick={newsHandle} />
                    <NewsAlert alert={newsCounter}>
                        <AlertCounter>{newsCounter}</AlertCounter>
                    </NewsAlert>
                </Navbar>
                : null}
            <Switch>
                <Route exact path="/" component={SignIn} />
                <Route exact path="/signin" component={SignIn} />
                <Route exact path="/signup" component={SignUp} />
                <Route exact path="/pwdreset" component={PasswordReset} />
                <Route exact path="/profile" component={Profile} />
                <Route exact path="/patients" component={Pacientes} />
                <Route exact path="/patient/:id" component={Paciente} />
                <Route exact path="/patient" component={Paciente} />
                <Route exact path="/ficha" component={Ficha} />
                <Route exact path="/bills" component={Facturas} />
                <Route exact path="/stats" component={Estadisticas} />
                <Route exact path="/agenda" component={Agenda} />
                <Route exact path="/news" component={Comunicados} />
                <Route exact path="/occupation" component={Ocupacion} />
                <Route exact path="/options" component={Opciones} />
                <Route exact path="/feedback" component={Feedback} />
                <Route >
                    {() => redirect()}
                </Route>
            </Switch>
            <Loader />
        </Suspense>
    )
}

const Navbar = styled.div`
	--id: NavBar;
	display: grid;
	grid-template-columns: 40px 130px 1fr 53px;
	align-items: start;
	background: white;
	box-shadow: 0px 1px 5px black;
	width: 100vw;
	height: 50px;
	color: white;
`
const Logo = styled.img`width: 124px;`
const Avatar = styled.img`
	overflow: hidden;
	border-radius: 50%;
	width: 50px;
	height: 50px;
    object-fit: cover;
	box-shadow: 2px 2px 6px black;
`
const Title = styled.div`
    --id:Title;
    font-size:25px;
    color:#777;
    text-shadow:1px 1px 1px #ddd;
    padding:10px;
`
const NewsAlert = styled.div`
    --id: NewsAlert;
    position: absolute;
    right: 45px;
    top: 3px;
    border-radius: 50%;
    background: red;
    box-shadow: 1px 1px 4px black;
    width: 18px;
    height: 18px;
    opacity: ${props => ((props.alert > 0) ? 1 : 0)};
`
const AlertCounter = styled.div`
    color: white;
    font-size:12px;
    text-align:center;
`