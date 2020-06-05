import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import logo from './assets/images/integralmenteET.png'

import {useHistory} from 'react-router-dom'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import {useToasts} from 'react-toast-notifications'
import {useDispatch,useSelector, shallowEqual} from 'react-redux'
import {bl} from './redux'

import SignUp from './pages/SignUp'
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import PasswordReset from "./pages/PasswordReset";
import Menu from './components/Menu'
import Loader from './common/Loader'

import Ficha from './pages/pacientes/Ficha'
import Paciente from './pages/pacientes/Paciente'
import Pacientes from './pages/pacientes/Pacientes'
import Facturas from './pages/Facturas'
import Estadisticas from './pages/Estadisticas'
import Opciones from './pages/Opciones'
import Agenda from './pages/Agenda'
import Comunicados from './pages/Comunicados'
import Ocupacion from './pages/Ocupacion'

export default function App()
{
    console.log('APP render.............')

    const {addToast} = useToasts()
    const history = useHistory()
    const dispatch = useDispatch()
    const msgInfo = useSelector(st => st.ui.msgInfo)
    const userInfo = useSelector(st => st.fb.userInfo)
    const allNews = useSelector(st => st.fb.allNews, shallowEqual)
    const [newsCounter, setNewsCounter] = useState(0)


    const newsHandle = (e)=>{
        history.push('/news')
    }

    useEffect(() =>
    {
        if (userInfo!=null && userInfo){
            const cnt = allNews.filter(a => a.fecha > userInfo.lastNewsRead).length
            setNewsCounter(cnt)
        }
    }, [allNews, userInfo])

    useEffect(
        () =>
        {
            if (msgInfo) addToast(msgInfo.msg, {appearance: msgInfo.type, autoDismiss: true})
        },
        [msgInfo]
    )

    useEffect(() => {
        dispatch(bl.getAllNews())
    }, [])

    return (
        <>
            {userInfo
                ? <Navbar>
                    <Menu />
                    <Logo src={logo} />
                    <div />
                    <Avatar src={userInfo.photoURL} onClick={newsHandle}/>
                    <NewsAlert alert={newsCounter}>
                        <AlertCounter>{newsCounter}</AlertCounter>
                    </NewsAlert>
                </Navbar>
                : null}
            <Switch>
                <Route exact path="/" exact component={SignIn} />
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
                <Route>
                    <h1>404</h1>
                </Route>
            </Switch>
            <Loader />
        </>
    )
}

const Navbar = styled.div`
	--id: NavBar;
	display: grid;
	grid-template-columns: 50px 100px 1fr 53px;
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
	box-shadow: 2px 2px 6px black;
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
    opacity: ${props => ((props.alert>0) ? 1 : 0)};
`
const AlertCounter =styled.div`
    color: white;
    font-size:12px;
    text-align:center;
`