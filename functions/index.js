const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const cors = require('cors')({ origin: true })
const moment = require('moment')
// const smtpTransport = require('nodemailer-smtp-transport')
// const execSync = require('child_process').execSync

// const { Vonage } = require('@vonage/server-sdk')
// const vonage = new Vonage({
//     apiKey: "4ef27424",
//     apiSecret: "bhZpr92ly4tAfCWf"
// })


admin.initializeApp(functions.config().firebase)
const afs = admin.firestore()

const userTracksCol = afs.collection('userTracks')

userTracksCol.onSnapshot((snapshot) => {
    for (const change of snapshot.docChanges()) {
        const doc = change.doc
        const userId = doc.id

        const docRef = userTracksCol.doc(userId)
        docRef.get().then((docSnapshot) => {
            if (docSnapshot.exists) {
                const userData = docSnapshot.data()
                userData.id = userData.time
                const today = moment().format('YYMMDD')
                const trackDateCol = afs.collection(`userTracks/${userId}/trackDates/${today}/coords`)

                if (change.type === 'added') {
                    console.log(`New user added: ${userId} -> ${today}`)
                    trackDateCol.doc(userId).set(userData)
                } else if (change.type === 'modified') {
                    console.log(`User updated: ${userId} -> ${today}`)
                    trackDateCol.doc(userId).set(userData)
                }
            }
        })
    }
})


exports.reportPos = functions.https.onCall((data, context) => {
    const lat = data.lat
    const lng = data.lng

    const pos = 'pos: ' + lat + ';' + lng
    console.log(pos)
    sendPos(lat, lng)
    return pos
})
exports.reportGPS = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*')
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    response.set('Access-Control-Allow-Headers', 'Content-Type')

    const lat = request.query.lat
    const lng = request.query.lng

    const pos = 'pos: ' + lat + ';' + lng
    console.log(pos)
    sendPos(lat, lng)
    response.send("Se envio " + pos)
})
exports.getTrackerStatus = functions.https.onCall((data, context) => {
    const { user } = data
    const refEstadoIntervalo = admin.database().ref(`intervalos/${user}`)
    refEstadoIntervalo.once('value', snapshot => {
        const estadoActual = snapshot.val() || false
        return { status: estadoActual }
    })
})
exports.trackerAction = functions.https.onCall((data, context) => {
    const { user, status, delta } = data
    let timer = 120
    if (delta)
        timer = delta

    if (!user) {
        return { error: 'Faltan parámetros: user o intervaloSegundos' }
    }

    const refEstadoIntervalo = admin.database().ref(`intervalos/${user}`)
    refEstadoIntervalo.once('value', snapshot => {
        const estadoActual = snapshot.val() || false // Si no existe, por defecto desactivado
        let intervaloId // Declarar variable fuera del callback

        if (estadoActual && !status) { // Desactivar intervalo
            clearInterval(intervaloId)
            refEstadoIntervalo.set(false)
        } else if (!estadoActual && status) { // Activar intervalo
            intervaloId = setInterval(() => {
                sendCommand(user, 'gps', '')
            }, timer * 1000)
            refEstadoIntervalo.set(true)
        }
        return {
            mensaje: `Tracker ${user}: ${status}`,
            estadoActual: estadoActual
        }
    })
})
exports.command = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*')
    response.set('Access-Control-Allow-Methods', 'GET, POST')
    response.set('Access-Control-Allow-Headers', 'Content-Type')

    const topic = request.query.topic
    const cmd = request.query.cmd
    const args = request.query.args
    sendCommand(topic, cmd, args)
    response.send("Msg: topic:" + topic + " cmd:" + cmd + ' args:' + args)
})
exports.happyBirthday = functions.https.onRequest((request, response) => {
    fcmPush('YBHqrkv2VBS5VAJuWweey1TO8zf2', 'Pablito')
    response.send("Happy Birtday!")
})
exports.evalCumples = functions.https.onRequest(async (request, response) => {
    const today = moment().format('MMDD')
    let birthdaysErrors = 0
    let birthdaysToday = 0

    const qsn = await afs.collection('pacientes').get()
    const docsPac = qsn.docs.map(x => x.data())

    for (let pac of docsPac) {
        try {
            const kid = pac.apellido + ', ' + pac.nombres

            if (!pac.nacimiento) {
                console.log('Falta cargar nacimiento: ', kid)
            }
            else {
                const cumple = moment(pac.nacimiento).format('MMDD')
                if (today === cumple) {
                    const noti = {
                        title: 'Cumples INTEGRALMENTE',
                        body: 'Feliz cumple ' + kid + `🎂🎈`
                    }
                    console.log('today:' + today + ' --> ' + cumple + ' Ap: ' + kid)
                    const uids = Object.keys(pac.uids)
                    console.log('uids: ' + uids)
                    for (let k of uids) {
                        await fcmPush(k, noti)
                    }
                    birthdaysToday++
                }
            }
        } catch (error) {
            birthdaysErrors++
        }
    }

    const qsu = await afs.collection('users').get()
    const docsUsr = qsu.docs.map(x => x.data())

    for (let usr of docsUsr) {
        try {
            if (!usr.birthday) {
                console.log('Falta cargar nacimiento: ', usr.displayName)
            }
            else {
                const cumple = moment(usr.birthday).format('MMDD')
                if (today === cumple) {
                    const noti = {
                        title: 'INTEGRALMENTE: Cumple profesional!!',
                        body: 'Feliz cumpleaños ' + usr.displayName + `😃`
                    }
                    console.log('today:' + today + ' --> ' + cumple + ' Ap: ' + usr.displayName)
                    await fcmPush('global', noti)
                    // if (usr.mail){
                    //     await sendMailTo(usr.mail, usr.nombres)
                    // }
                    birthdaysToday++
                }
            }
        } catch (error) {
            birthdaysErrors++
        }
    }

    const rta = 'patients: ' + docsPac.length + ' / prof.total: ' + docsUsr.length
    console.log(rta)
    response.send('total: ' + rta + ' ==> fecha:' + today + ' cumples hoy: ' + birthdaysToday + ' errors: ' + birthdaysErrors)
})
exports.sendMail = functions.https.onRequest(async (req, res) => {
    const mail = req.body.mail // req.query.mail;
    const person = req.body.person //req.query.person;

    const rta = await sendMailTo(mail, person)
    res.send(rta)
})
exports.sendSMSFCM = functions.https.onRequest((req, res) => {
    const { toNumber, body } = req.body
    admin.messaging().sendToPhoneNumber({
        to: toNumber,
        body,
    })
    res.json({
        messageSid: "ok",
    })
})
// exports.sendSMS = functions.https.onRequest((req, res) => {
//     const { toNumber, body } = req.body
//     // admin.messaging().sendToPhoneNumber({
//     //     to: toNumber,
//     //     body,
//     // })
//     const from = "Vonage APIs"
//     const to = toNumber
//     const text = body

//     async function sendSMSVonage() {
//         await vonage.sms.send({ to, from, text })
//             .then(resp => {
//                 console.log('Message sent successfully')
//                 console.log(resp)
//             })
//             .catch(err => {
//                 console.log('There was an error sending the messages.')
//                 console.error(err)
//             })
//     }
//     sendSMSVonage()
//     res.json({
//         messageSid: "ok",
//     })
// })





async function sendCommand (topic, cmd, args) {
    // cmd:'ring',
    // args: '{"nombre":"Pablo"}'

    // cmd:'startTracker',
    // args:

    // cmd:'stopTracker',
    // args:
    try {
        const payload = {
            topic: topic,
            data: { cmd },
            android: {
                priority: 'high'
            },
            apns: {
                headers: {
                    'apns-priority': '5'
                }
            }
        }
        if (args)
            payload.data["args"] = args

        await admin.messaging().send(payload)
        console.log('Msg sent => pl:' + JSON.stringify(payload))
    }
    catch (err) {
        console.log('Error sending msg:', err)
    }
}
async function sendPos (lat, lng) {
    try {
        const payload = {
            data: { lat: lat.toString(), lng: lng.toString() },
            topic: 'PAM'
        }
        await admin.messaging().send(payload)
        console.log('Msg sent ok to topic => pl:' + JSON.stringify(payload))
    }
    catch (err) {
        console.log('Error sending msg:', err)
    }
}
async function fcmPush (target, noti) {
    try {
        const payload = {
            notification: noti,
            data: {}
        }
        //admin.messaging().sendToDevice('cLedIiDzTKe_GUvCbn0_qN:APA91bGkEmS0zYUqUrTCN_1ZSkb2L5AIkhIFgKnuxCcSz54fy8KbLfSa57Cjfhw5kiEGbOR97GTA2QtOBCbW4jlV6ZAZ', payload)
        await admin.messaging().sendToTopic(target, payload)
        console.log('Msg sent ok to ' + target + ' => pl:' + JSON.stringify(payload))
    }
    catch (err) {
        console.log('Error sending msg:', err)
    }
}
async function sendMailTo (mail, person) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, //true,
            auth: {
                user: 'integralmenteespacioterapeutic@gmail.com',
                pass: 'IntegralMente2020'
            }
        })

        cors(req, res, () => {
            console.log('mailTo: ' + mail + ' => ' + person)
            const mailOptions = {
                //from: 'IntegralMente <integralmenteespacioterapeutic@gmail.com>',
                from: 'integralmenteespacioterapeutic@gmail.com',
                to: mail,
                subject: 'Feliz cumpleaños!!!',
                html: `<h2 style="font-size: 16px;">Que los cumplas muy feliz, ${person}</h2>
                <br />
                <h3>Te desea IntegralMente</h3>
                <br />
                <img src="https://firebasestorage.googleapis.com/v0/b/pp-integralmente.appspot.com/o/integralmenteET.png?alt=media&token=2fe6482e-e6ff-4197-b2cf-2642e55e72c0" />`
            }
            transporter.sendMail(mailOptions, (erro, info) => {
                if (erro) {
                    console.log('error sending email:', erro.toString())
                    return reject(erro.toString())
                }
                const rta = "mail sent to: " + person + " => " + mail
                return resolve(rta)
            })
        })
    })
}


// const sto = admin.storage()
// export const deletePDFs = functions.firestore.document("facturas/{id}").onDelete((snap, context) => {
//     // const {id} = context.params;
//     const nombre = context.params['nombre']
//     console.log('nombre:', nombre)
//     const bucket = sto.bucket();

//     // const imagesRemovePromises = deletedImages.map((imagePath: string) => {
//     //   return bucket.file(imagePath).delete();
//     // });
//     return new Promise((resolve, reject)=>{
//         resolve(true)
//     })
//     // return bucket.deleteFiles({
//     //     prefix: `facturas/${nombre}`
//     // });
// });

