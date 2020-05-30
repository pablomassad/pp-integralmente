import {handleActions} from 'redux-actions'
import {fb} from './fbActions'

const initialState = {
    userInfo: null,
    facturas: [],
    selFactura: undefined,
    patients: [],
    selPatient: undefined,
    sessions: [],
    selSession: undefined,
    notifications: [],
    token: undefined,
    webToken:undefined
}

export default handleActions(
    {
        [fb.addNotification]: (state, action) =>
        {
            return {...state, notifications: [...state.notifications, action.payload.notification]}
        },
        [fb.setToken]: (state, action) =>
        {
            return {...state, token: action.payload.token}
        }, 
        [fb.setWebToken]: (state, action) =>
        {
            return {...state, webToken: action.payload.webToken}
        },
        [fb.setUser]: (state, action) =>
        {
            return {...state, userInfo: action.payload.userInfo}
        },
        [fb.setPatients]: (state, action) =>
        {
            return {...state, patients: action.payload.patients}
        },
        [fb.setPatient]: (state, action) =>
        {
            return {...state, selPatient: {...state.selPatient, ...action.payload}}
        },
        [fb.setFacturas]: (state, action) =>
        {
            console.log(action.payload.facturas)
            return {...state, facturas: action.payload.facturas}
        },
        [fb.setFactura]: (state, action) =>
        {
            return {...state, selFactura: {...state.selFactura, ...action.payload}}
        },
        [fb.setSessions]: (state, action) =>
        {
            console.log(action.payload.sessions)
            return {...state, sessions: action.payload.sessions}
        },
        [fb.setSession]: (state, action) =>
        {
            return {...state, selSession: {...state.selSession, ...action.payload}}
        }        
    },
    initialState
)
