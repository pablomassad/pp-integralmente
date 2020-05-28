import {fb, ui} from '../'
import firebase from '../../firebase'

import {Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed} from '@capacitor/core'
import {FCM} from "capacitor-fcm";

const {PushNotifications} = Plugins;
const fcm = new FCM();
// alternatively - without types
const {FCMPlugin} = Plugins;



const login = payload => async dispatch =>
{
    let res = false
    try {
        dispatch(ui.showLoader(true))
        await firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        dispatch(ui.showMessage({msg: 'Bienvenido a Integralmente!', type: 'success'}))
        const user = await firebase.auth().currentUser
        const userInfo = await getFirebaseUserInfo(user.uid)
        await saveFirebaseUserInfo(userInfo)
        dispatch(fb.setUser({userInfo}))
        res = true
    } catch (error) {
        dispatch(
            ui.showMessage({
                msg: error.message,
                type: 'error'
            })
        )
    } finally {
        dispatch(ui.showLoader(false))
        return res
    }
}
const initPushing = payload => async dispatch =>
{
    // dispatch(initWebNotifications())
    setTimeout(() =>
    {
        dispatch(initMobileNotifications())
    }, 10000)
}
const initWebNotifications = () => dispatch =>
{
    dispatch(ui.showMessage({
        msg: 'Init WebNotifications....',
        type: 'info'
    }))
    console.log('Init WebNotifications....')

    const messaging = firebase.messaging()
    messaging.requestPermission()
        .then(() =>
        {
            return messaging.getToken()
        })
        .then(token =>
        {
            console.log('token:', token)
            dispatch(ui.showMessage({
                msg: 'Registered Token: ' + token,
                type: 'success'
            }))
            dispatch(fb.setWebToken({token}))
        })
        .catch(err =>
        {
            console.log('Error getting web token: ', err)
        })
}
const initMobileNotifications = () => (dispatch, getState) =>
{
    const userInfo = getState().fb.userInfo
    dispatch(ui.showMessage({
        msg: 'Registration of user: ' + userInfo.id,
        type: 'info'
    }))

    try {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register()
            .then(() =>
            {
                // Subscribe to a specific topic
                // you can use `FCMPlugin` or just `fcm`

                dispatch(ui.showMessage({
                    msg: 'Registrando en Firebase',
                    type: 'info'
                }))
                FCMPlugin.subscribeTo({topic: userInfo.id})
                    .then(r =>
                    {
                        dispatch(ui.showMessage({
                            msg: 'Subscribed to topic: ' + userInfo.id,
                            type: 'success'
                        }))
                    })
                    .catch(err =>
                    {
                        dispatch(ui.showMessage({
                            msg: 'Error subscribing topic: ' + err,
                            type: 'error'
                        }))
                        console.log(err);
                    })
            })
            .catch(err =>
            {
                dispatch(ui.showMessage({
                    msg: "Error mobile registration: " + JSON.stringify(err),
                    type: 'error'
                }))
                console.log(JSON.stringify(err))
            })

        // //////////////////////////////////////////////////////////
        // // Unsubscribe from a specific topic
        // fcm
        //     .unsubscribeFrom({topic: "test"})
        //     .then(() => alert(`unsubscribed from topic`))
        //     .catch(err => console.log(err));

        // //////////////////////////////////////////////////////////
        // // Get FCM token instead the APN one returned by Capacitor
        // fcm
        //     .getToken()
        //     .then(r => alert(`Token ${r.token}`))
        //     .catch(err => console.log(err));

        // //////////////////////////////////////////////////////////
        // // Remove FCM instance
        // fcm
        //     .deleteInstance()
        //     .then(() => alert(`Token deleted`))
        //     .catch(err => console.log(err));



        // On succcess, we should be able to receive notifications
        PushNotifications.addListener('registration', tk =>
        {
            // alert('Push registration success, token: ' + tk.value)
            dispatch(fb.setToken({webToken: tk.value}))
            // Enviar token a Firebase 
        })

        // Some issue with your setup and push will not work
        PushNotifications.addListener('registrationError', error =>
        {
            alert('Error on mobile registration: ' + JSON.stringify(error))
            console.log('error')
        })

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', notification =>
        {
            dispatch(ui.showMessage({
                msg: notification.title,
                type: 'info'
            }))

            const notif = {
                id: notification.id,
                title: notification.title,
                body: notification.body
            }
            dispatch(fb.addNotification(notif))
        })

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', notification =>
        {
            dispatch(ui.showMessage({
                msg: notification.data.title,
                type: 'info'
            }))
            const notif = {
                id: notification.data.id,
                title: notification.data.title,
                body: notification.data.body
            }
            dispatch(fb.addNotification(notif))
        })
    } catch (error) {
        dispatch(ui.showMessage({
            msg: 'NO WEB implementation of PushNotification (only mobile)',
            type: 'error'
        }))
        console.log('NO WEB implementation of PushNotification (only mobile)')
    }
}
const getAllPatients = () => async (dispatch, getState) =>
{
    dispatch(ui.showLoader(true))
    const dsn = await firebase.firestore().collection('pacientes').get()
    const patients = dsn.docs.map(x => x.data())
    dispatch(
        fb.setPatients({
            patients
        })
    )
    dispatch(ui.showLoader(false))
}
const getPatients = () => async (dispatch, getState) =>
{
    dispatch(ui.showLoader(true))
    const userInfo = getState().fb.userInfo
    const dsn = await firebase.firestore().collection('pacientes').where('uid', '==', userInfo.id).get()
    const patients = dsn.docs.map(x => x.data())
    dispatch(
        fb.setPatients({
            patients
        })
    )
    dispatch(ui.showLoader(false))
}
const getFacturas = () => async (dispatch, getState) =>
{
    dispatch(ui.showLoader(true))
    const userInfo = getState().fb.userInfo
    const dsn = await firebase.firestore().collection('facturas').where('uid', '==', userInfo.id).get()
    const facturas = dsn.docs.map(x =>
    {
        return {
            ...x.data(),
            ...{
                id: x.id
            }
        }
    })
    dispatch(fb.setFacturas({facturas}))
    dispatch(ui.showLoader(false))
    return true
}
const updatePatient = (id, patient) => async dispatch =>
{
    dispatch(ui.showLoader(true))
    await firebase.firestore().collection('pacientes').doc(id).set(patient, {
        merge: true
    })
    dispatch(
        fb.setPatient({
            patient
        })
    )
    dispatch(ui.showLoader(false))
}
const removePatient = payload => async dispatch =>
{
    //await firebase.firestore().collection('pacientes').doc(payload.id).delete()
    getPatients()
}
const updateFactura = factura => async (dispatch, getState) =>
{
    try {
        if (factura.id === 0) delete factura.id

        delete factura.dirty
        factura.estado = factura.fechaPago ? 'Cobrada' : 'Pendiente'
        factura.uid = getState().fb.userInfo.id

        if (!factura.id) {
            const bill = await firebase.firestore().collection('facturas').add(factura)
            factura.id = bill.id
        }
        await firebase.firestore().collection('facturas').doc(factura.id).set(factura, {merge: true})

        // debugger
        // const oldBills = getState().fb.facturas
        // const facturas = oldBills.map(f => (f.id == factura.id ? {...f, ...factura} : f))
        // dispatch(fb.setFacturas({facturas}))
        await dispatch(getFacturas())
        return true
    } catch (error) {
        return false
    }
}
const removeFactura = factura => async dispatch =>
{
    // if (factura.nombre)
    //     await dispatch(deleteFileStorage('facturas', factura))
    await firebase.firestore().collection('facturas').doc(factura.id).delete()
    await dispatch(getFacturas())
}
const deleteFileStorage = (path, factura) => async dispatch =>
{
    const photoRef = firebase.storage.getReferenceFromUrl(factura.url)
    // @Override
    // public void onSuccess(Void aVoid) {
    //     // File deleted successfully
    //     Log.d(TAG, "onSuccess: deleted file");
    // }
    // }).addOnFailureListener(new OnFailureListener() {
    // @Override
    // public void onFailure(@NonNull Exception exception) {
    //     // Uh-oh, an error occurred!
    //     Log.d(TAG, "onFailure: did not delete file");
    // }
}
const uploadFileStorage = (path, file) => async dispatch =>
{
    dispatch(ui.showLoader(true))
    return new Promise((resolve, reject) =>
    {
        const uploadTask = firebase.sto.ref(path + '/' + file.name).put(file)
        uploadTask.on(
            'state_changed',
            snapshot =>
            {
                console.log('progress', snapshot)
            },
            error =>
            {
                console.log(error)
                dispatch(ui.showLoader(false))
                reject()
            },
            async () =>
            {
                const url = await firebase.sto.ref(path).child(file.name).getDownloadURL()
                console.log('url file: ', url)
                dispatch(ui.showLoader(false))
                resolve(url)
            }
        )
    })
}
const requestPermission = () => async dispatch =>
{
    firebase.getToken()
    // firebase.requestPermission()
}
///////////////////////////////////////
// Private functions
///////////////////////////////////////
const getFirebaseUserInfo = async id =>
{
    const dsn = await firebase.firestore().doc(`users/${id}`).get()
    const user = dsn.data()
    user['id'] = id
    return user
}
const saveFirebaseUserInfo = async usr =>
{
    usr.lastLogin = new Date().getTime()
    usr.lastLoginStr = usr.lastLogin
    //   const obj = JSON.parse(JSON.stringify(usr))
    await firebase.firestore().doc(`users/${usr.id}`).set(usr, {
        merge: true
    })
}



export const bl = {
    login,
    initPushing,
    initWebNotifications,
    initMobileNotifications,
    getAllPatients,
    getPatients,
    updatePatient,
    removePatient,
    getFacturas,
    updateFactura,
    removeFactura,
    deleteFileStorage,
    uploadFileStorage,
    requestPermission
}
