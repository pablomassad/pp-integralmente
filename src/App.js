import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import logo from './assets/images/integralmenteET.png'

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import {useToasts} from 'react-toast-notifications'
import {useSelector} from 'react-redux'

import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Menu from './components/Menu'
import Loader from './common/Loader'

import Paciente from './pages/pacientes/Paciente'
import Pacientes from './pages/pacientes/Pacientes'
import Facturas from './pages/Facturas'
import Opciones from './pages/Opciones'

import firebase from './firebase'

export default function App()
{
   const {addToast} = useToasts()
   const msgInfo = useSelector(st => st.ui.msgInfo)
   const userInfo = useSelector(st => st.fb.userInfo)

   const [fbInitialized, setFbInitialized] = useState(false)

   useEffect(() =>
   {
      firebase.isInitialized().then(val =>
      {
         setFbInitialized(val)
      })
   }, [])

   useEffect(() =>
   {
      if (msgInfo)
         addToast(msgInfo.msg, {appearance: msgInfo.type, autoDismiss: true})
   }, [msgInfo])


   return (fbInitialized) ? (
      <Router>
         {userInfo ? (
            <Navbar>
               <Menu />
               <Logo src={logo} />
               <div></div>
               <Avatar src={userInfo.photoURL} />
            </Navbar>
         ) : null
         }
         <Switch>
            <Route exact path="/" exact component={Login} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/patients" component={Pacientes} />
            <Route exact path="/patient" component={Paciente} />
            <Route exact path="/bills" component={Facturas} />
            <Route exact path="/options" component={Opciones} />
         </Switch>
         <Loader />
      </Router>
   ) : <Loader />
}

const Navbar = styled.div`
    --id:NavBar;
    display:grid;
    grid-template-columns:50px 100px 1fr 53px;
    align-items:start;
    background: white;
    box-shadow: 0px 1px 5px black;
    width: 100vw;
    height: 50px;
    color: white;
`
const Logo = styled.img`
    width:124px;
`
const Avatar = styled.img`
    overflow:hidden;
    border-radius:50%;
    width:50px;
    height: 55px;
    box-shadow:1px 1px 3px black;
`