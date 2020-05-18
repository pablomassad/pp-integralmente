import {fb, ui} from '../'
import firebase from '../../firebase'

const login = (payload) =>
{
    return async (dispatch) =>
    {
        try {
            dispatch(ui.showLoader(true))
            await firebase.login(payload.email, payload.password)
            dispatch(ui.showMessage({msg: 'Bienvenido a Integralmente!', type: 'success'}))
            const user = await firebase.getCurrentUser()
            const userInfo = await getUserInfo(user.uid)
            await updateUserInfo(userInfo)
            dispatch(fb.setUser({userInfo}))
            dispatch(ui.showLoader(false))
        }
        catch (error) {
            dispatch(ui.showMessage({msg: error.message, type: 'error'}))
        }
    }
}
const getPatients = (payload) =>
{
    return async (dispatch, getState) =>
    {
        dispatch(ui.showLoader(true))
        const userInfo = getState().fb.userInfo
        const dsn = await firebase.db.collection('pacientes').where('uid', '==', userInfo.id).get()
        const patients = dsn.docs.map(x=>x.data())
        dispatch(fb.setPatients({patients}))
        dispatch(ui.showLoader(false))
    }
}

const getFacturas = (payload) =>
{
    return async (dispatch, getState) =>
    {
        dispatch(ui.showLoader(true))
        const userInfo = getState().fb.userInfo
        const dsn = await firebase.db.collection('facturas').where('uid', '==', userInfo.id).get()
        const facturas = dsn.docs.map(x=>x.data())
        dispatch(fb.setFacturas({facturas}))
        dispatch(ui.showLoader(false))
    }
}
const updatePatient = (payload )=>{
    return async (dispatch, getState)=>{
        dispatch(ui.showLoader(true))
        const pat = getState().fb.selPatient
        await firebase.db.collection('pacientes').doc(pat.id).set(payload, {merge:true})
        dispatch(fb.setPatient({payload}))
        dispatch(ui.showLoader(false))
    }
}
const removePatient = (payload)=>{
    return async (dispatch)=>{
        //await firebase.db.collection('pacientes').doc(payload.id).delete()
        getPatients()
    }
}
const updateFactura = (payload)=>{
    return async (dispatch)=>{
        const id = payload.id
        delete payload.id
        await firebase.db.doc(`facturas/${id}`).set(payload, {merge: true})
        getFacturas()
    }
}
const removeFactura = (payload)=>{
    return async (dispatch)=>{
        //await firebase.db.collection('facturas').doc(payload.id).delete()
        getFacturas()
    }
}


///////////////////////////////////////
// Private functions
///////////////////////////////////////
const getUserInfo = async (id) =>
{
    const dsn = await firebase.db.doc(`users/${id}`).get()
    const user = dsn.data()
    user['id'] = id
    return user
}
const updateUserInfo = async (usr) =>
{
    usr.lastLogin = new Date().getTime()
    usr.lastLoginStr = usr.lastLogin
    //   const obj = JSON.parse(JSON.stringify(usr))
    await firebase.db.doc(`users/${usr.id}`).set(usr, {merge: true})
}

export const bl = {
    login,
    getUserInfo,
    updateUserInfo,
    getPatients,
    updatePatient,
    removePatient,
    getFacturas,
    updateFactura,
    removeFactura
}
