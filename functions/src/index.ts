import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as moment from 'moment'

admin.initializeApp(functions.config().firebase)
const afs = admin.firestore()
const sto = admin.storage()



export const deletePDFs = functions.firestore.document("facturas/{id}").onDelete((snap, context) => {
    // const {id} = context.params;
    const nombre = context.params['nombre']
    console.log('nombre:', nombre)
    const bucket = sto.bucket();

    // const imagesRemovePromises = deletedImages.map((imagePath: string) => {
    //   return bucket.file(imagePath).delete();
    // });
    return new Promise((resolve, reject)=>{
        resolve(true)
    })
    // return bucket.deleteFiles({
    //     prefix: `facturas/${nombre}`
    // });
});

export const happyBirthday = functions.https.onRequest((request, response) => {
    fcmPush('YBHqrkv2VBS5VAJuWweey1TO8zf2', 'Pablito')
    response.send("Happy Birtday!");
});

export const evalBirthdays = functions.https.onRequest(async (req, res) => {
    const qsInfo = await afs.collection('pacientes').get()
    const docs = qsInfo.docs.map(x => x.data())

    const today = moment().format('YYMMDD')
    const birthdaysToday = 0
    docs.forEach(pac => {
        if (pac.nacimiento !== undefined) {
            if (today === moment(pac.nacimiento).format('YYMMDD')) {
                fcmPush(pac.uid, pac.apellido + ', ' + pac.nombres)
            }
        }
    })
    console.log('response: ', birthdaysToday)
    res.send(birthdaysToday)
})

function fcmPush(target: string, kid: string) {
    const payload = {
        notification: {
            title: 'Cumples INTEGRALMENTE',
            body: 'Feliz cumple ' + kid
        },
        data: {
        }
    };
    admin.messaging().sendToTopic(target, payload)
        .then(x => {
            console.log('Msg sent ok to ' + target)
        })
        .catch(err => {
            console.log('Error sending msg')
        })

    // if (rec.uuid === '65791d28a26e25b3') {
    //    const payload = {
    //       notification: {
    //          title: 'Estado conexion: ' + rec.online,
    //          body: rec.manufacturer + '/' + rec.model + '/' + rec.uuid
    //       },
    //       data: {
    //       }
    //    };
    //    logger('Push connection: ', rec)
    //    return admin.messaging().sendToTopic('dbm', payload);
    // }      
}
