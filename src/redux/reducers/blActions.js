import {fb, ui} from '../'
import {fbAuth, fbSto, fbFs} from '../../fb.service'
import moment from 'moment'
import {Plugins} from '@capacitor/core'
// import {FCM} from "capacitor-fcm";


// SECURITY
const logEnterApp = userInfo => async dispatch =>
{
    try {
        const day = moment().format('YYMMDD')
        const dd = await fbFs.doc(`logger/${day}`).get()
        let pl = dd.data()

        if (!pl)
            pl = {id: day}

        if (!pl[userInfo.id])
            pl[userInfo.id] = 0
        pl[userInfo.id]++
        await fbFs.doc(`logger/${day}`).set(pl, {merge: true})
        return true
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo conectar con la DB.', type: 'error'}))
        console.log('Logger error:', error)
        return false
    }
}
const getUsers = () => async dispatch =>
{
    try {
        const dsn = await fbFs.collection('users').get()
        const users = dsn.docs.map(x => x.data())
        dispatch(fb.setUsers({users}))
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo obtener usuarios.', type: 'error'}))
    }
}
const updateUser = userInfo => async dispatch =>
{
    try {
        dispatch(ui.showLoader(true))
        await fbFs.doc(`users/${userInfo.id}`).set(userInfo, {merge: true})
        return userInfo
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
    }
}
const login = payload => async dispatch =>
{
    let res = false
    try {
        dispatch(ui.showLoader(true))
        await fbAuth.signInWithEmailAndPassword(payload.email, payload.password)
        dispatch(ui.showMessage({msg: 'Bienvenido a IntegralMente!', type: 'success'}))
        const user = await fbAuth.currentUser
        const userInfo = await getFirebaseUserInfo(user.uid)
        userInfo.lastLogin = new Date().getTime()
        userInfo.lastLoginStr = new Date()
        if (!userInfo.lastNewsRead)
            userInfo.lastNewsRead = new Date(1262314800000)

        await dispatch(updateUser(userInfo))
        dispatch(fb.setUser({userInfo}))

        localStorage.setItem('credentials', JSON.stringify(payload))
        dispatch(initPushing())
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
const register = payload => async dispatch =>
{
    let res = false
    try {
        dispatch(ui.showLoader(true))

        const {user} = await fbAuth.createUserWithEmailAndPassword(payload.email, payload.password);
        generateUserDocument(user, {displayName: payload.displayName});

        dispatch(ui.showMessage({msg: 'Registración terminada. Bienvenido a IntegralMente!', type: 'success'}))
        res = true
    } catch (error) {
        dispatch(
            ui.showMessage({
                msg: error.message,
                type: 'error'
            })
        )
    }
    finally {
        dispatch(ui.showLoader(false))
        return res
    }
}
const sendResetEmail = email => async dispatch =>
{
    return fbAuth.sendPasswordResetEmail(email)
        .then(() =>
        {
            return true
        })
        .catch(() =>
        {
            return false
        })
}


// NOTIFICATIONS
const {PushNotifications} = Plugins;
//const fcm = new FCM();
// alternatively - without types
const {FCMPlugin} = Plugins;
const initPushing = payload => async dispatch =>
{
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

    // const m = messaging()
    // m.requestPermission()
    //     .then(() =>
    //     {
    //         return m.getToken()
    //     })
    //     .then(token =>
    //     {
    //         console.log('token:', token)
    //         dispatch(ui.showMessage({
    //             msg: 'Registered Token: ' + token,
    //             type: 'success'
    //         }))
    //         dispatch(fb.setWebToken({token}))
    //     })
    //     .catch(err =>
    //     {
    //         console.log('Error getting web token: ', err)
    //     })
}
const initMobileNotifications = () => (dispatch, getState) =>
{
    const userInfo = getState().fb.userInfo
    try {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register()
            .then(() =>
            {
                FCMPlugin.subscribeTo({topic: userInfo.id})
                    .then(r =>
                    {
                        dispatch(ui.showMessage({
                            msg: 'Suscripto a Cumples IntegralMente!'+ `🎈`,
                            type: 'success'
                        }))
                    })
                    .catch(err =>
                    {
                        dispatch(ui.showMessage({
                            msg: 'Error en suscripcion: ' + err,
                            type: 'error'
                        }))
                        console.log(err);
                    })

                FCMPlugin.subscribeTo({topic: 'global'})
                    .then(r =>
                    {
                       console.log('subcribed to GLOBAL ok')
                    })
                    .catch(err =>
                    {
                        console.log('Error subscribing topic: ' + err)
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
const requestPermission = () => async dispatch =>
{
    //firebase.getToken()
    // firebase.requestPermission()
}


// PATIENTS
const getAllPatients = () => async (dispatch) =>
{
    try {
        const dsn = await fbFs.collection('pacientes').get()
        const allPatients = dsn.docs.map(x =>
        {
            return {
                ...x.data(),
                ...{id: x.id}
            }
        })
        dispatch(fb.setAllPatients(allPatients))
        return allPatients
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo obtener pacientes de la agenda, intente nuevamente.', type: 'error'}))
    }
}
const updatePatient = patient => async (dispatch, getState) =>
{
    try {
        dispatch(ui.showLoader(true))

        if (patient.id === 0) delete patient.id

        if (!patient.id) {
            const pat = await fbFs.collection('pacientes').add(patient)
            patient.id = pat.id
        }
        await fbFs.collection('pacientes').doc(patient.id).set(patient)
        return patient
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
        dispatch(ui.setDirty(false))
    }
}
const removePatient = (patient, uid) => async (dispatch) =>
{
    // elimina sesiones del paciente

    // elimina adjuntos del paciente

    delete patient.uids[uid]
    await fbFs.collection('pacientes').doc(patient.id).set(patient)

    if (Object.keys(patient.uids).length === 0)
        await fbFs.collection('pacientes').doc(patient.id).delete()

    dispatch(fb.setPatient(null))
}
const clonePatient = patAgenda => async (dispatch, getState) =>
{
    try {
        dispatch(ui.showLoader(true))
        const userInfo = getState().fb.userInfo

        if (patAgenda.uids[userInfo.id]) {
            dispatch(ui.showMessage({msg: 'El paciente ya se encuentra agendado en su lista de pacientes!', type: 'warning'}))
            return false
        }
        else {
            const o = {}
            o.photoURL = userInfo.photoURL
            o.atencion = ''
            o.diagnostico = ''
            patAgenda.uids[userInfo.id] = o

            await fbFs.collection('pacientes').doc(patAgenda.id).set(patAgenda, {merge: true})
            dispatch(ui.showMessage({msg: 'Paciente agregado.', type: 'success'}))
            return true
        }
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo agregar el paciente.', type: 'error'}))
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
    }
}
const getAttachmentsByPatient = (patientId) => async (dispatch) =>
{
    dispatch(ui.showLoader(true))
    const dsn = await fbFs.collection('pacientes').doc(patientId).collection('adjuntos').get()
    const attachments = dsn.docs.map(x =>
    {
        return {
            ...x.data(),
            ...{
                id: x.id
            }
        }
    })
    dispatch(fb.setAttachments({attachments}))
    dispatch(ui.showLoader(false))
    return true
}
const addAttachmentByPatient = (patientId, attachment) => (dispatch) =>
{

}
const removeAttachment = (attachmentId) => (dispatch) =>
{

}


// SESSIONS
const getSessionsByPatient = (patientId) => async (dispatch) =>
{
    dispatch(ui.showLoader(true))
    const dsn = await fbFs.collection('pacientes').doc(patientId).collection('sesiones').get()
    const sessions = dsn.docs.map(x =>
    {
        return {
            ...x.data(),
            ...{
                id: x.id
            }
        }
    })
    dispatch(fb.setSessions({sessions}))
    dispatch(ui.showLoader(false))
    return true
}
const updateSession = (patientId, session) => async (dispatch, getState) =>
{
    dispatch(ui.showLoader(true))
    try {
        const userInfo = getState().fb.userInfo
        if (session.id === 0) {
            delete session.id
            session.uid = userInfo.id
        }

        if (!session.id) {
            const s = await fbFs.collection('pacientes').doc(patientId).collection('sesiones').add(session)
            session.id = s.id
        }
        await fbFs.collection('pacientes').doc(patientId).collection('sesiones').doc(session.id).set(session, {merge: true})
        await dispatch(getSessionsByPatient(patientId))
        return true
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
        dispatch(ui.setDirty(false))
    }
}
const removeSession = (patientId, sessionId) => async (dispatch) =>
{
    // if (session.nombre)
    //     await dispatch(deleteFileStorage('sessions', session))
    await fbFs.collection('pacientes').doc(patientId).collection('sesiones').doc(sessionId).delete()
    await dispatch(getSessionsByPatient(patientId))
}


// FACTURAS
const getFacturas = () => async (dispatch, getState) =>
{
    dispatch(ui.showLoader(true))
    const userInfo = getState().fb.userInfo
    const dsn = await fbFs.collection('facturas').where('uid', '==', userInfo.id).get()
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
const updateFactura = factura => async (dispatch, getState) =>
{
    dispatch(ui.showLoader(true))
    try {
        if (factura.id === 0) delete factura.id

        factura.estado = factura.fechaPago ? 'Cobrada' : 'Pendiente'
        factura.uid = getState().fb.userInfo.id

        if (!factura.id) {
            const bill = await fbFs.collection('facturas').add(factura)
            factura.id = bill.id
        }
        await fbFs.collection('facturas').doc(factura.id).set(factura, {merge: true})
        await dispatch(getFacturas())
        return true
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
        dispatch(ui.setDirty(false))
    }
}
const removeFactura = facturaId => async dispatch =>
{
    // if (factura.nombre)
    //     await dispatch(deleteFileStorage('facturas', factura))
    await fbFs.collection('facturas').doc(facturaId).delete()
    await dispatch(getFacturas())
}
const getStatistics = () => async (dispatch, getState) =>
{
    dispatch(ui.showLoader(true))
    const userInfo = getState().fb.userInfo
    await updateStatistics(userInfo.id)
    const dsn = await fbFs.collection('historial').doc(userInfo.id).collection('facturacion').get()
    const stats = dsn.docs.map(x =>
    {
        return {
            ...x.data(),
            ...{
                id: convertToDate(x.id) //moment(x.id, "YYMM").toDate() //x.id
            }
        }
    })
    dispatch(fb.setStats({stats}))
    dispatch(ui.showLoader(false))
    return true
}


// COMUNICATIONS NEWS
const getAllNews = () => (dispatch) =>
{
    fbFs.collection('news').onSnapshot(qsn =>
    {
        console.log('Snapshot News!!!!')
        const arr = qsn.docs.map(x =>
        {
            return {
                ...x.data(),
                ...{
                    id: x.id
                }
            }
        })
        const allNews = arr.sort((f1, f2) =>
        {
            const d1 = f1['fecha']
            const d2 = f2['fecha']
            if (typeof d1 === 'number') {
                return d2 - d1;
            }
            const s1 = `${d1}`;
            const s2 = `${d2}`;
            return s2.localeCompare(s1);
        });
        dispatch(fb.setAllNews({allNews}))
    })
}
const updateNews = news => async (dispatch) =>
{
    dispatch(ui.showLoader(true))
    try {
        if (news.id === 0) delete news.id

        if (!news.id) {
            const tmp = await fbFs.collection('news').add(news)
            news.id = tmp.id
        }
        await fbFs.collection('news').doc(news.id).set(news, {merge: true})
        await dispatch(getAllNews())
        return true
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
        dispatch(ui.setDirty(false))
    }
}
const removeNews = newsId => async dispatch =>
{
    await fbFs.collection('news').doc(newsId).delete()
    await dispatch(getAllNews())
}
const updateNewsRead = () => async (dispatch, getState) =>
{
    const usr = getState().fb.userInfo
    const userInfo = {...usr}
    userInfo.lastNewsRead = new Date().getTime()
    dispatch(fb.setUser({userInfo}))
    dispatch(updateUser(userInfo))
}


// OCCUPATION
const getDistribution = () => async (dispatch) =>
{
    dispatch(ui.showLoader(true))
    const dd = await fbFs.collection('config').doc('modules').get()
    const distribution = dd.data().distribution
    dispatch(fb.setDistribution({distribution}))
    dispatch(ui.showLoader(false))
    return true
}
const updateDistribution = (payload) => async (dispatch) =>
{
    try {
        dispatch(ui.showLoader(true))
        const o = {distribution: payload}
        await fbFs.collection('config').doc('modules').set(o, {merge: true})
        //await dispatch(getDistribution())
        return true
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
    }
}


// FEEDBACK
const addFeedback = (feedback) => async (dispatch) =>
{
    try {
        dispatch(ui.showLoader(true))
        if (feedback.id === 0) delete feedback.id

        if (!feedback.id) {
            const fback = await fbFs.collection('feedback').add(feedback)
            feedback.id = fback.id
        }
        await fbFs.collection('feedback').doc(feedback.id).set(feedback, {merge: true})
        return true
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
        dispatch(ui.setDirty(false))
    }
}


// FIREBASE STORAGE
const deleteFileStorage = (path, url) => async dispatch =>
{
    //const file = fbSto.getReferenceFromUrl(url)


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
        try {
            const uploadTask = fbSto.ref(path + '/' + file.name).put(file)
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
                    const url = await fbSto.ref(path).child(file.name).getDownloadURL()
                    console.log('url file: ', url)
                    dispatch(ui.showLoader(false))
                    resolve(url)
                }
            )
        } catch (error) {
            dispatch(ui.showLoader(false))
            reject()
        }
    })
}
const uploadPhotoStorage = (path, file, name) => async (dispatch) =>
{
    dispatch(ui.showLoader(true))
    return new Promise((resolve, reject) =>
    {
        try {
            const uploadTask = fbSto.ref(path + '/' + name).putString(file, 'data_url')
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
                    const url = await fbSto.ref(path).child(name).getDownloadURL()
                    console.log('url file: ', url)
                    dispatch(ui.showLoader(false))
                    resolve(url)
                }
            )
        } catch (error) {
            dispatch(ui.showLoader(false))
            reject()
        }
    })
}


///////////////////////////////////////////////////////
// PRIVATE METHODS
const convertToDate = (yymm) =>
{
    var year = 20 + yymm.substring(0, 2)
    var month = yymm.substring(2, 4)
    var date = new Date(year, month - 1)

    // var date = moment(yymm, 'YYMM').format('MM/YY')
    console.log('date: ', date)
    return date
}
const getFirebaseUserInfo = async id =>
{
    const dsn = await fbFs.doc(`users/${id}`).get()
    const user = dsn.data()
    user['id'] = id
    return user
}
const generateUserDocument = async (user, additionalData) =>
{
    if (!user) return;
    const userRef = fbFs.doc(`users/${user.uid}`);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
        const {email, displayName, photoURL} = user;
        try {
            await userRef.set({
                displayName,
                email,
                photoURL,
                ...additionalData
            });
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
    return getUserDocument(user.uid);
}
const getUserDocument = async uid =>
{
    if (!uid) return null;
    try {
        const userDocument = await fbFs.doc(`users/${uid}`).get();
        return {
            uid,
            ...userDocument.data()
        };
    } catch (error) {
        console.error("Error fetching user", error);
    }
}
const updateStatistics = async (uid) =>
{
    const dsn = await fbFs.collection('facturas').where('uid', '==', uid).get()
    const facturas = dsn.docs.map(x => x.data())

    let fac = {}
    for (let f of facturas) {
        const grp = moment(f.fecha).format('YYMM')
        const monto = Number.parseInt(f.monto)

        if (!fac[grp])
            fac[grp] = {}

        if ((f.estado === 'Cobrada') || (f.fechaPago)) {
            if (!fac[grp].cobradas)
                fac[grp].cobradas = 0
            fac[grp].cobradas += monto
        }

        if (!fac[grp].facturadas)
            fac[grp].facturadas = 0
        fac[grp].facturadas += monto
    }

    let totalPend = 0
    for (let grp in fac) {
        if (!fac[grp].pendientes)
            fac[grp].pendientes = 0

        if (!fac[grp].cobradas)
            fac[grp].cobradas = 0
        const pendGrp = (fac[grp].facturadas - fac[grp].cobradas)
        fac[grp].pendientes = totalPend + pendGrp
        totalPend = fac[grp].pendientes
    }

    var facIds = Object.keys(fac)
    facIds.forEach(async (id) =>
    {
        console.log("yymm", id);
        console.log('fac', fac[id])

        await fbFs.collection("historial").doc(uid).collection("facturacion").doc(id).set(fac[id], {merge: true})
    })
}



export const bl = {
    logEnterApp,
    getUsers,
    login,
    register,
    sendResetEmail,
    initPushing,
    initWebNotifications,
    initMobileNotifications,
    getAllPatients,
    updatePatient,
    removePatient,
    clonePatient,
    getFacturas,
    updateFactura,
    removeFactura,
    getSessionsByPatient,
    updateSession,
    removeSession,
    getAllNews,
    updateNews,
    removeNews,
    getAttachmentsByPatient,
    addAttachmentByPatient,
    removeAttachment,
    deleteFileStorage,
    uploadFileStorage,
    uploadPhotoStorage,
    requestPermission,
    updateNewsRead,
    updateUser,
    getStatistics,
    getDistribution,
    updateDistribution,
    addFeedback
}
