const fs = require('fs')
const execSync = require('child_process').execSync;
//var copydir = require('copy-dir');

let version = process.argv[2]
if (!version) {
    console.log('##########################')
    console.log('Version parameter missing!')
    console.log('##########################')
    process.exit();
}

console.log('')
console.log('###################')
console.log('Build Integralmente')
console.log('###################')
execSync('yarn build', {
    stdio: 'inherit'
});

console.log('')
console.log('##################')
console.log('Deploy Firebase')
console.log('##################')
execSync('firebase deploy', {
    stdio: 'inherit'
});

console.log('')
console.log('##################')
console.log('Sync Capacitor')
console.log('##################')
execSync('npx cap sync', {
    stdio: 'inherit'
});

// console.log('')
// console.log('##################')
// console.log('Open Android')
// console.log('##################')
// execSync('npx cap open Android', {
//     stdio: 'inherit'
// });

console.log('')
console.log('##################')
console.log('Build APK')
console.log('##################')

execSync('cd android', {
    stdio: 'inherit'
});

execSync('gradlew assembleDebug', {
    stdio: 'inherit'
});

execSync('cd ..', {
    stdio: 'inherit'
});





console.log('')
console.log('######################')
console.log('Upload to Google Drive')
console.log('######################')
const dest = '/Users/pablomassad/Google Drive/PP/P♡P/P&P Soft/Integralmente/' + 'IntegralMente.v' + version + '.apk'
fs.copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk', dest)


console.log('')
console.log('######################')
console.log('-----FINALIZADO-------')
console.log('######################')






