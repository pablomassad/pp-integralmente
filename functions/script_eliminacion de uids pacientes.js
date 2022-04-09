var admin = require("firebase-admin");
var moment = require("moment");
var fs = require("fs");

var serviceAccount = require("./serviceKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pp-integralmente.firebaseio.com",
});

let db = admin.firestore();


db.collection('pacientes').get()
    .then(async qsInfo =>
    {
        const docs = qsInfo.docs.map(x => x.data())
        console.log('TOTAL: ', docs.length)
        let i = 0
        for (let p of docs) {
            if (p.uid) {
                delete p.uid
                await db.collection('pacientes').doc(p.id).set(p)
                i++
            }
        }
        console.log('Total pacientes modificados:', i)
    })
    .catch((err) =>
    {
        console.log("Error getting documents", err);
    });

