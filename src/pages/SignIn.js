import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'
import logo from '../assets/images/integralmenteET.png'

import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {bl, ui} from '../redux'

import GlassButton from '../common/GlassButton'


export default function SignIn()
{
    const history = useHistory()
    const dispatch = useDispatch()

    const [email, setEmail] = useState()
    const [password, setPassword] = useState()

    const refEmail = useRef(null)
    const refPassword = useRef(null)

    const onChangeHandler = async e =>
    {
        if (e.target.name === 'email') setEmail(e.target.value)
        if (e.target.name === 'password') setPassword(e.target.value)
    }
    const resetPassHandle = async e =>
    {
        if (!email)
            dispatch(ui.showMessage({msg:'Debe ingresar un correo válido!', type:'error'}))
        else {
            const res = await dispatch(bl.sendResetEmail(email))
            if (res)
                dispatch(ui.showMessage({msg: 'Se ha enviado el correo de recuperación', type: 'info' }))
            else
                dispatch(ui.showMessage({msg: 'Error al enviar correo de recuperación', type: 'error' }))
        }
    }
    const gotoRegisterHandle = e =>
    {
        history.push('/signup')
    }
    const onKeyUserHandler = e =>
    {
        if (e.key === 'Enter') refPassword.current.focus()
    }
    const loginHandle = async event =>
    {
        event.preventDefault()
        loginRedirect({email, password})
    }
    const autoLogin = async () =>
    {
        loginRedirect({email: 'patriciagonzalezvillar@gmail.com', password: '123456'})
    }
    const loginRedirect = async (o) =>
    {
        const res = await dispatch(bl.login(o))
        if (res) {
            dispatch(bl.initPushing())
            history.push('/patients')
        }
    }

    useEffect(() =>
    {
        refEmail.current.focus()
    }, [])

    return (
        <LoginFrame>
            <Logo src={logo} onClick={autoLogin} />
            <FormLogin>
                <div>
                    <UserInput
                        ref={refEmail}
                        className="form-control"
                        type="text"
                        name="email"
                        value={email || ''}
                        onChange={onChangeHandler}
                        placeholder="Correo electrónico"
                        onKeyDown={onKeyUserHandler}
                        required
                    />
                </div>
                <UserInput
                    ref={refPassword}
                    className="form-control"
                    type="password"
                    name="password"
                    value={password || ''}
                    onChange={onChangeHandler}
                    placeholder="Constraseña"
                    required
                />
                <GlassButton type="submit" height="40" onClick={loginHandle}>
                    Ingresar
				</GlassButton>
                <RegisterReset>
                    <GlassButton background={'green'} type="submit" height="40" onClick={resetPassHandle}>
                        Olvidé contraseña
				    </GlassButton>
                    <GlassButton background={'green'} type="submit" height="40" onClick={gotoRegisterHandle}>
                        Registarse
				    </GlassButton>
                </RegisterReset>
            </FormLogin>
        </LoginFrame>
    )
}


const LoginFrame = styled.div`
	background: white;
	box-shadow: 5px 5px 15px black;
	border-radius: 20px;
	padding: 20px;
	margin: auto;
	margin-top: 10%;
	max-width: 500px;
	width: 80%;
`
const Logo = styled.img`
	width: 100%;
	margin-bottom: 20px;
`
const FormLogin = styled.div`--name: FormLogin;`
const UserInput = styled.input`
	--name: 'UserInput';
	padding: 5px 10px;
	font-size: 15px;
	color: #444;
	background: white;
	border-radius: 5px;
	width: 80%;
	height: 35px;
	border: none;
	display: block;
	margin: 20px auto;
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
const RegisterReset = styled.div`
    display:grid;
    grid-template-columns:1fr 1fr;
    align-items:center;
`
