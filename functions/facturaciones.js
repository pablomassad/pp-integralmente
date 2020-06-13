var admin = require("firebase-admin");
var moment = require("moment")

var serviceAccount = require("./serviceKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pp-integralmente.firebaseio.com'
})

let afs = admin.firestore()


const uid = 'YBHqrkv2VBS5VAJuWweey1TO8zf2'
afs.collection('facturas').where('uid', '==', uid).get()
    .then(dsn =>
    {
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


        // Insert en DB
        var facIds = Object.keys(fac)
        facIds.forEach(async (id) =>
        {
            console.log("yymm", id);
            console.log('fac', fac[id])
            
            await afs.collection("historial").doc(uid).collection("facturacion").doc(id).set(fac[id], {merge: true})
        })
    }
    )
