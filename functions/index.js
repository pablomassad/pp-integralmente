const functions = require('firebase-functions');
const admin = require('firebase-admin')
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const execSync = require('child_process').execSync;
const cors = require('cors')({origin: true});
const moment = require('moment');


admin.initializeApp(functions.config().firebase)
const afs = admin.firestore()

exports.reportPos = functions.https.onCall((data, context) => {
    const lat = data.lat;
    const lng = data.lng;

    const pos = 'pos: ' + lat + ';' + lng
    console.log(pos)
    sendPos(lat,lng)
    return pos;
})
exports.command = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    const topic = request.query.topic;
    const cmd = request.query.cmd;
    const args = request.query.args;
    sendCommand(topic, cmd, args)
    response.send("Se pusheo " + cmd + args);
})
exports.reportGPS = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    const lat = request.query.lat;
    const lng = request.query.lng;

    const pos = 'pos: ' + lat + ';' + lng
    console.log(pos)
    sendPos(lat,lng)
    response.send("Se envio " + pos);
})
exports.ring = functions.https.onRequest((request, response) =>
{
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    const topic = request.query.topic
    const nombre = request.query.nombre

    console.log('topic:', topic)
    console.log('nombre:', nombre)
    ring(topic,nombre)
    response.send("Han tocado timbre en INTEGRALMENTE:" + nombre + " para: " + topic);
})
exports.happyBirthday = functions.https.onRequest((request, response) =>
{
    fcmPush('YBHqrkv2VBS5VAJuWweey1TO8zf2', 'Pablito')
    response.send("Happy Birtday!");
})
exports.evalCumples = functions.https.onRequest(async (request, response) =>
{
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
                    if (usr.mail){
                        await sendMailTo(usr.mail, usr.nombres)
                    }
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
exports.sendMail = functions.https.onRequest(async (req, res) =>
{
    const mail = req.body.mail // req.query.mail;
    const person = req.body.person //req.query.person;

    const rta = await sendMailTo(mail, person)
    res.send(rta)
})


async function sendCommand( topic, cmd, args)
{
    // cmd:'ring',
    // args: '{"nombre":"Pablo"}'

    // cmd:'startTracker',
    // args:

    // cmd:'stopTracker',
    // args:
    try {
        const payload = {
            topic:topic,
            data: {cmd}
        };
        if (args)
            payload.data["args"]=args

        await admin.messaging().send(payload)
        console.log('Msg sent => pl:' + JSON.stringify(payload))
    }
    catch (err) {
        console.log('Error sending msg:', err)
    }
}
async function ring( topic, nombre)
{
    try {
        const payload = {
            data: {nombre},
            topic:topic
        };
        await admin.messaging().send(payload)
        console.log('Msg sent ok to topic => pl:' + JSON.stringify(payload))
    }
    catch (err) {
        console.log('Error sending msg:', err)
    }
}
async function sendPos( lat,lng)
{
    try {
        const payload = {
            data: {lat:lat.toString(), lng:lng.toString()},
            topic:'PAM'
        };
        await admin.messaging().send(payload)
        console.log('Msg sent ok to topic => pl:' + JSON.stringify(payload))
    }
    catch (err) {
        console.log('Error sending msg:', err)
    }
}
async function fcmPush(target, noti)
{
    try {
        const payload = {
            notification: noti,
            data: {}
        };
        //admin.messaging().sendToDevice('cLedIiDzTKe_GUvCbn0_qN:APA91bGkEmS0zYUqUrTCN_1ZSkb2L5AIkhIFgKnuxCcSz54fy8KbLfSa57Cjfhw5kiEGbOR97GTA2QtOBCbW4jlV6ZAZ', payload)
        await admin.messaging().sendToTopic(target, payload)
        console.log('Msg sent ok to ' + target + ' => pl:' + JSON.stringify(payload))
    }
    catch (err) {
        console.log('Error sending msg:', err)
    }
}
async function sendMailTo(mail, person)
{
    return new Promise((resolve, reject) =>
    {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, //true,
            auth: {
                user: 'integralmenteespacioterapeutic@gmail.com',
                pass: 'IntegralMente2020'
            }
        })

        cors(req, res, () =>
        {
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
            transporter.sendMail(mailOptions, (erro, info) =>
            {
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

