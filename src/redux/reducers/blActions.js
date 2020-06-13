import {fb, ui} from '../'
import {fbAuth, fbMsg, fbSto, fbFs} from '../../fb.service'
import moment from 'moment'
import {Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed} from '@capacitor/core'
import {FCM} from "capacitor-fcm";


// SECURITY
const logEnterApp = userInfo => async dispatch =>
{
    try {
        const day = moment().format('YYMMDD')
        const dd = await fbFs.doc(`logger/${day}`).get()
        const pl = dd.data()

        if (!pl)
            pl = {id: day}

        if (!pl[userInfo.id])
            pl[userInfo.id] = 0
        pl[userInfo.id]++
        await fbFs.doc(`logger/${day}`).set(pl, {merge: true})
        return true
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo conectar con la DB.', type: 'error'}))
        return false
    }
}
const getUsers = payload => async dispatch =>
{
    try {
        const dsn = await fbFs.collection('users').get()
        const users = dsn.docs.map(x => x.data())
        dispatch(fb.setUsers({users}))
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo obtener usuarios.', type: 'error'}))
    }
}
const updateUser = usr => async dispatch =>
{
    try {
        dispatch(ui.showLoader(true))
        await fbFs.doc(`users/${usr.id}`).set(usr, {merge: true})
        return usr
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
const fcm = new FCM();
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

    const messaging = messaging()
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
const requestPermission = () => async dispatch =>
{
    //firebase.getToken()
    // firebase.requestPermission()
}


// PATIENTS
const getAllPatients = () => async (dispatch, getState) =>
{
    try {
        dispatch(ui.showLoader(true))
        const users = getState().fb.users
        const dsn = await fbFs.collection('pacientes').get()
        const res = dsn.docs.map(x =>
        {
            return {
                ...x.data(),
                ...{id: x.id}
            }
        })
        const allPatients = []
        const replicates = []
        res.forEach(p =>
        {
            if (p.idOrig)
                replicates.push(p)
            else
                allPatients.push(p)
        })

        // Fill professionals array
        allPatients.forEach(p =>
        {
            const reps = replicates.filter(r => r.idOrig === p.id)
            reps.push(p)
            p.uPhotos = []
            reps.forEach(r =>
            {
                const usr = users.find(u => u.id === r.uid)
                if (usr) {
                    p.uPhotos.push(usr.photoURL)
                }
            })
        })
        dispatch(fb.setAllPatients(allPatients))
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo obtener pacientes de la agenda, intente nuevamente.', type: 'error'}))
    }
    finally {
        dispatch(ui.showLoader(false))
    }
}
const getPatients = () => async (dispatch, getState) =>
{
    try {
        dispatch(ui.showLoader(true))
        const userInfo = getState().fb.userInfo
        const dsn = await fbFs.collection('pacientes').where('uid', '==', userInfo.id).get()
        const patients = dsn.docs.map(x =>
        {
            return {
                ...x.data(),
                ...{id: x.id}
            }
        })
        dispatch(fb.setPatients({patients}))
    } catch (error) {
        dispatch(ui.showMessage({msg: 'No se pudo obtener los pacientes, intente nuevamente.', type: 'error'}))
    }
    finally {
        dispatch(ui.showLoader(false))
    }
}
const updatePatient = patient => async (dispatch, getState) =>
{
    try {
        dispatch(ui.showLoader(true))
        if (patient.id === 0) delete patient.id

        delete patient.uPhotos
        patient.uid = getState().fb.userInfo.id

        if (!patient.id) {
            const pat = await fbFs.collection('pacientes').add(patient)
            patient.id = pat.id
        }
        await fbFs.collection('pacientes').doc(patient.id).set(patient, {merge: true})
        return patient
    } catch (error) {
        return false
    }
    finally {
        dispatch(ui.showLoader(false))
        dispatch(ui.setDirty(false))
    }
}
const removePatient = patientId => async dispatch =>
{
    await fbFs.collection('pacientes').doc(patientId).delete()
    dispatch(fb.setPatient(null))
    await dispatch(getPatients())
}
const clonePatient = patient => async (dispatch, getState) =>
{
    try {
        dispatch(ui.showLoader(true))
        const userInfo = getState().fb.userInfo
        const patients = getState().fb.patients

        const found = patients.find(x => x.id === patient.id)
        if (found)
            dispatch(ui.showMessage({msg: 'El paciente ya se encuentra agendado en su lista de pacientes!', type: 'warning'}))
        else {
            const newPatient = {...patient}
            newPatient.uid = userInfo.id
            newPatient.idOrig = patient.id
            delete newPatient.id
            delete newPatient.atencion
            delete newPatient.diagnostico
            delete newPatient.uPhotos

            const pat = await fbFs.collection('pacientes').add(newPatient)
            newPatient.id = pat.id
            await fbFs.collection('pacientes').doc(newPatient.id).set(newPatient, {merge: true})
            dispatch(ui.showMessage({msg: 'Paciente agregado.', type: 'success'}))
        }
        return true
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
const updateSession = (patientId, session) => async (dispatch) =>
{
    dispatch(ui.showLoader(true))
    try {
        if (session.id === 0) delete session.id
        session.estado = session.fechaPago ? 'Cobrada' : 'Pendiente'

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
const getStatistics = () => async (dispatch) =>
{
    dispatch(ui.showLoader(true))
    const dsn = await fbFs.collection('facturacion').get()
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
    const user = getState().fb.userInfo
    user.lastNewsRead = new Date().getTime()
    await fbFs.collection('users').doc(user.id).set(user, {merge: true})
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
    var year = 20 + yymm.substring(0, 2);
    var month = yymm.substring(2, 4);

    var date = new Date(year, month - 1);
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
    getPatients,
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
