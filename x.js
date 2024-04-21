const fs = require('fs')
const execSync = require('child_process').execSync;
const minimist = require('minimist')

const args = minimist(process.argv.slice(2), {
    default: {
        v: '1.0',
        b: 'true',
        f: 'true',
        a: 'true'
    },
    alias: {
        v: 'version',
        b: 'buildFlag',
        f: 'cloudFunction',
        a: 'buildApk'
    }
})

const ver = Number(args.version)
if (!isNaN(ver)) {
    console.log('')
    console.log('##########################')
    console.log('Update environment version')
    console.log('##########################')
    let bufferConfig = fs.readFileSync(__dirname + '/src/docs/.env')
    let strConfig = bufferConfig.toString()
    strConfig = strConfig.replace('N.N', args.version)

    fs.writeFileSync(__dirname + '/.env', strConfig, err =>
    {
        if (err == null)
            console.log('Archivo .env actualizado OK')
        else
            console.log('Error saving .env: ', err)
    })
}

if (args.buildFlag === 'true') {
    console.log('')
    console.log('###################')
    console.log('Build Integralmente')
    console.log('###################')
    execSync('yarn build', {
        stdio: 'inherit'
    })
}

if (args.cloudFunction === 'true') {
    console.log('')
    console.log('##################')
    console.log('Deploy to Firebase')
    console.log('##################')
    execSync('firebase deploy --only hosting', {
        stdio: 'inherit'
    })
}

if (args.buildApk === 'true') {
    console.log('')
    console.log('##################')
    console.log('Sync Capacitor')
    console.log('##################')
    execSync('npx cap sync', {
        stdio: 'inherit'
    })

    console.log('')
    console.log('##################')
    console.log('Build APK')
    console.log('##################')

    process.chdir('./android');

    execSync('pwd', {
        stdio: 'inherit'
    })

    execSync('./gradlew assembleDebug', {
        stdio: 'inherit'
    })
    process.chdir('..');

    console.log('')
    console.log('######################')
    console.log('Upload to Google Drive')
    console.log('######################')
    const dest = '/Users/pablin/My Drive/PP/P&P Soft/Integralmente/' + 'IntegralMente.v' + args.version + '.apk'
    fs.copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk', dest)
}


console.log('')
console.log('######################')
console.log('-----FINALIZADO-------')
console.log('######################')






