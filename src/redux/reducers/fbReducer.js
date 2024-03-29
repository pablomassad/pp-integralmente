import {handleActions} from 'redux-actions'
import {fb} from './fbActions'

const initialState = {
    users: undefined,
    userInfo: null,
    allPatients:[],
    patients: [],
    selPatient: undefined,
    sessions: [],
    selSession: undefined,
    facturas: [],
    selFactura: undefined,
    allNews: [],
    selNews: undefined,
    notifications: [],
    token: undefined,
    webToken: undefined,
    attachments: [],
    stats: undefined,
    distribution: []
}

export default handleActions(
    {
        [fb.setDistribution]: (state, action) =>
        {
            return {...state, distribution: action.payload.distribution}
        },
        [fb.setUsers]: (state, action) =>
        {
            return {...state, users: action.payload.users}
        },
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
        [fb.setAllPatients]: (state, action) =>
        {
            console.log('setAllPatients:',action.payload)
            return {...state, allPatients: action.payload}
        },
        [fb.setPatient]: (state, action) =>
        {
            return {...state, selPatient: action.payload}
        },
        [fb.setFacturas]: (state, action) =>
        {
            return {...state, facturas: action.payload.facturas}
        },
        [fb.setFactura]: (state, action) =>
        {
            return {...state, selFactura: {...state.selFactura, ...action.payload}}
        },
        [fb.setSessions]: (state, action) =>
        {
            return {...state, sessions: action.payload.sessions}
        },
        [fb.setSession]: (state, action) =>
        {
            return {...state, selSession: {...state.selSession, ...action.payload}}
        },
        [fb.setAllNews]: (state, action) =>
        {
            return {...state, allNews: action.payload.allNews}
        },
        [fb.setNews]: (state, action) =>
        {
            return {...state, selNews: {...state.selNews, ...action.payload}}
        },
        [fb.setAttachments]: (state, action) =>
        {
            return {...state, attachments: action.payload.attachments}
        },
        [fb.setStats]: (state, action) =>
        {
            return {...state, stats: action.payload.stats}
        },
    },
    initialState
)
