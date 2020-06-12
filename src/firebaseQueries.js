var admin = require("firebase-admin");
var moment = require("moment");
var fs = require("fs");

var serviceAccount = require("./firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pp-integralmente.firebaseio.com",
});

let db = admin.firestore();


db.collection('logger').get()
    .then(qsInfo =>
    {
        const docs = qsInfo.docs.map(x => x.data())
        console.log('TOTAL: ', docs.length)
    })
    .catch((err) =>
    {
        console.log("Error getting documents", err);
    });

