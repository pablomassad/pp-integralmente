import {handleActions} from 'redux-actions'
import {fb} from './fbActions'


const initialState = {
   userInfo: null,
   facturas: [],
   selFactura: undefined,
   patients: [],
   selPatient: undefined
}


export default handleActions({
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
      const mergePatient = {...state.selPatient, ...action.payload}
      return {...state, selPatient: mergePatient}
   },
   [fb.setFacturas]: (state, action) =>
   {
      return {...state, facturas: action.payload.facturas}
   },
   [fb.setFactura]: (state, action) =>
   {
      return {...state, selFactura: {...state.selFactura, ...action.payload.selFactura}}
   }
}, initialState)

