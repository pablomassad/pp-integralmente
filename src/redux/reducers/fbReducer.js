import {handleActions} from 'redux-actions'
import {fb} from './fbActions'


const initialState = {
    userInfo: null,
    facturas:[],
    patients: [],
    patient:undefined
}


export default handleActions({
    [fb.setUser]: (state, action) =>
    {
        return {...state, userInfo: action.payload.userInfo}
    },
    [fb.setFacturas]: (state, action) =>
    {
        return {...state, facturas: action.payload.facturas}
    }, 
    [fb.setPatients]: (state, action) =>
    {
        return {...state, patients: action.payload.patients}
    },
    [fb.setPatient]: (state, action) =>
    {
        return {...state, selPatient: action.payload.selPatient}
    }
}, initialState)

