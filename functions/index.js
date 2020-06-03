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
    const qsn = await afs.collection('pacientes').get()
    const docs = qsn.docs.map(x => x.data())

    const today = moment().format('YYMMDD')
    let birthdaysErrors = 0
    let birthdaysToday = 0
    docs.forEach(pac =>
    {
        try {
            if (today === moment(pac.nacimiento).format('YYMMDD')) {
                fcmPush(pac.uid, pac.apellido + ', ' + pac.nombres)
                birthdaysToday++
            }
        } catch (error) {
            birthdaysErrors++
        }
    })

    const rta = 'response: patients total: ' + docs.length
    console.log(rta)
    response.send('total pacientes: ' + rta + ' fecha:' + today + ' cumples hoy: ' + birthdaysToday + ' errors: ' + birthdaysErrors)
})

exports.processFacturas = functions.https.onRequest(async (request, response) =>
{
    const uid = 'YBHqrkv2VBS5VAJuWweey1TO8zf2'
    const dsn = await afs.collection('facturas').where('uid', '==', uid).get()
    const facturas = dsn.docs.map(x => x.data())

    // Recorro todas las facturas y voy acumulando x mes los totales de pendientes y cobradas
    let facCob = {}
    let facPend = {}
    let facEmit = {}

    for (let f of facturas) {
        const day = moment(f.fecha).format('YYMMDD')
        if ((f.estado === 'Cobrada') || (f.fechaPago)) {
            if (!facCob[day])
                facCob[day] = 0
            facCob[day] += Number.parseInt(f.monto)
        }
        else {
            if (!facPend[day])
                facPend[day] = 0
            facPend[day] += Number.parseInt(f.monto)
        }
        if (!facEmit[day])
            facEmit[day] = 0
        facEmit[day] += Number.parseInt(f.monto)
    }
    const rta = {
        emitidas:facEmit,
        cobradas:facCob,
        pendientes:facPend
    }
    response.send(rta)
    //await afs.collection("facturacion").doc(oldVersion).set(oldData, {merge: true})
})


function fcmPush(target, kid)
{
    const payload = {
        notification: {
            title: 'Cumples INTEGRALMENTE',
            body: 'Feliz cumple ' + kid
        },
        data: {
        }
    };
    //admin.messaging().sendToDevice('cLedIiDzTKe_GUvCbn0_qN:APA91bGkEmS0zYUqUrTCN_1ZSkb2L5AIkhIFgKnuxCcSz54fy8KbLfSa57Cjfhw5kiEGbOR97GTA2QtOBCbW4jlV6ZAZ', payload)
    admin.messaging().sendToTopic(target, payload)
        .then(x =>
        {
            console.log('Msg sent ok to ' + target)
        })
        .catch(err =>
        {
            console.log('Error sending msg')
        })
}