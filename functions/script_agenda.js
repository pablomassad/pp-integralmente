var admin = require("firebase-admin");
var moment = require("moment")

var serviceAccount = require("./serviceKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pp-integralmente.firebaseio.com'
})

let afs = admin.firestore()

const migracionEscalonada=()=>{
    afs.collection('pacientes').get()
        .then(async (dsn) =>
        {
            const patients = dsn.docs.map(x => x.data())

            afs.collection('users').get()
                .then(async (dsu) =>
                {
                    const users = dsu.docs.map(u => u.data())

                    let patCounter = 1
                    for (let p of patients) {
                        const usr = users.find(u => u.id === p.uid)

                        const o = {}
                        o.atencion = (p.atencion) ? p.atencion : ''
                        o.diagnostico = p.diagnostico ? p.diagnostico : ''
                        o.photoURL = usr.photoURL

                        await afs.collection('pacientes').doc(p.id).collection('uids').doc(p.uid).set(o, {merge: true})

                        const dsn_sessions = await afs.collection('pacientes').doc(p.id).collection('sesiones').get()
                        const sessions = dsn_sessions.docs.map(x => 
                        {
                            return {
                                ...x.data(),
                                ...{id: x.id}
                            }
                        })

                        for (let s of sessions) {
                            const o = {}
                            o.id = s.id
                            o.fecha = s.fecha
                            o.observaciones = s.observaciones
                            await afs.collection('pacientes').doc(p.id).collection('uids').doc(p.uid).collection('sesiones').doc(o.id).set(o)
                        }

                        const dsn_adjuntos = await afs.collection('pacientes').doc(p.id).collection('adjuntos').get()
                        const attachments = dsn_adjuntos.docs.map(x => 
                        {
                            return {
                                ...x.data(),
                                ...{id: x.id}
                            }
                        })
                        for (let a of attachments) {
                            const o = {}
                            o.id = a.id
                            o.extension = (a.extension) ? a.extension : ''
                            o.idSesion = (a.idSesion) ? a.idSesion : ''
                            o.nombre = (a.nombre) ? a.nombre : ''
                            o.url = (a.url) ? a.url : ''
                            await afs.collection('pacientes').doc(p.id).collection('uids').doc(p.uid).collection('adjuntos').doc(o.id).set(o)
                        }
                        console.log('paciente: ' + patCounter + ' ' + p.apellido + ' - id:' + p.id + ' sesiones:' + sessions.length + ' adjuntos:' + attachments.length)
                        patCounter++
                    }
                })
        })
}
const migracionParalela=()=>{
    afs.collection('pacientes').get()
        .then(async (dsn) =>
        {
            const patients = dsn.docs.map(x => x.data())

            afs.collection('users').get()
                .then(async (dsu) =>
                {
                    const users = dsu.docs.map(u => u.data())

                    let patCounter = 1
                    for (let p of patients) {

                        delete p.atencion
                        delete p.diagnostico
                        delete p.photoURL

                        // const usr = users.find(u => u.id === p.uid)

                        // const o = {}
                        // o.atencion = (p.atencion) ? p.atencion : ''
                        // o.diagnostico = p.diagnostico ? p.diagnostico : ''
                        // o.photoURL = usr.photoURL

                        // p.uids = {}
                        // p.uids[usr.id]={}
                        // p.uids[usr.id] = o

                        await afs.collection('pacientes').doc(p.id).set(p)

                        // const dsn_sessions = await afs.collection('pacientes').doc(p.id).collection('sesiones').get()
                        // const sessions = dsn_sessions.docs.map(x => 
                        // {
                        //     return {
                        //         ...x.data(),
                        //         ...{id: x.id}
                        //     }
                        // })

                        // for (let s of sessions) {
                        //     const o = {}
                        //     o.id = s.id
                        //     o.fecha = s.fecha
                        //     o.observaciones = s.observaciones
                        //     o.uid = usr.id
                        //     await afs.collection('pacientes').doc(p.id).collection('sesiones').doc(o.id).set(o)
                        // }

                        // const dsn_adjuntos = await afs.collection('pacientes').doc(p.id).collection('adjuntos').get()
                        // const attachments = dsn_adjuntos.docs.map(x => 
                        // {
                        //     return {
                        //         ...x.data(),
                        //         ...{id: x.id}
                        //     }
                        // })
                        // for (let a of attachments) {
                        //     const o = {}
                        //     o.id = a.id
                        //     o.extension = (a.extension) ? a.extension : ''
                        //     o.idSesion = (a.idSesion) ? a.idSesion : ''
                        //     o.nombre = (a.nombre) ? a.nombre : ''
                        //     o.url = (a.url) ? a.url : ''
                        //     o.uid = usr.id
                        //     await afs.collection('pacientes').doc(p.id).collection('adjuntos').doc(o.id).set(o)
                        // }
                        console.log('paciente: ' + patCounter + ' ' + p.apellido + ' - id:' + p.id )
                        patCounter++
                    }
                })
        })
}


//migracionEscalonada()
migracionParalela()


