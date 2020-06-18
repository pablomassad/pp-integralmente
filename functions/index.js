const functions = require('firebase-functions');
const admin = require('firebase-admin')
const moment = require('moment')



admin.initializeApp(functions.config().firebase)
const afs = admin.firestore()

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
                    birthdaysToday++
                }
            }
        } catch (error) {
            birthdaysErrors++
        }
    }

    const rta = 'patients: ' + docsPac.length + ' / prof.total: '+ docsUsr.length
    console.log(rta)
    response.send('total: ' + rta  + ' ==> fecha:' + today + ' cumples hoy: ' + birthdaysToday + ' errors: ' + birthdaysErrors)
})



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