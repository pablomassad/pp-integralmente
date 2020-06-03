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
            
            await afs.collection("facturacion").doc(id).set(fac[id], {merge: true})
        })
    }
    )




// let devicesRef = afs.collection("facturas");
// let devices = [];
// devicesRef
//     .get()
//     .then((snapshot) =>
//     {
//         if (snapshot.empty) {
//             console.log("No matching documents.");
//             return;
//         }

//         snapshot.forEach((doc) =>
//         {
//             devices.push({
//                 id: doc.id,
//                 legajo: doc.data().legajo,
//                 lastUsage: doc.data().lastUsage,
//             });
//         });

//         let legajos = devices.map((device) => device.legajo);
//         const findDuplicates = (legajos) =>
//             legajos.filter((item, index) => legajos.indexOf(item) != index);
//         //Obtengo los legajos duplicados
//         let legajosDuplicados = [...new Set(findDuplicates(legajos))];
//         // Me quedo con los registros que tienen legajos duplicados
//         let dupl = devices.filter((dev) => legajosDuplicados.includes(dev.legajo));

//         let result = [];
//         legajosDuplicados.forEach((duplicado) =>
//         {
//             result.push(dupl.filter((d) => d.legajo == duplicado));
//         });

//         result.forEach((duplicatesByUUIDArr) =>
//         {
//             duplicatesByUUIDArr.sort((a, b) => (a.lastUsage < b.lastUsage ? 1 : -1));

//             // Saco el primer elemento (el que no hay que borrar, el lastUsage más reciente)
//             duplicatesByUUIDArr.shift();
//         });
//         result = result.flat();

//         let final = [];
//         result.forEach((elem) =>
//         {
//             final.push(elem.id);
//         });

//         console.log("UUIDs a borrar por legajo: ", result);
//         console.log("UUIDs a borrar: ", final);

//         // BORRADO DE DATOS
//         final.forEach(async (item, index) =>
//         {
//             console.log("DELETE", item);
//             await devicesRef.doc(final[index]).delete();
//         });
//     })
//     .catch((err) =>
//     {
//         console.log("Error getting documents", err);
//     });
