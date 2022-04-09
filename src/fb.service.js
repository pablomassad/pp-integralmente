import app from 'firebase/app'
import "firebase/auth"
import "firebase/storage"
// import "firebase/messaging"
import "firebase/firebase-firestore"

const config = {
    apiKey:process.env.REACT_APP_apiKey,
    authDomain:process.env.REACT_APP_authDomain,
    databaseURL:process.env.REACT_APP_databaseURL,
    projectId:process.env.REACT_APP_projectId,
    storageBucket:process.env.REACT_APP_storageBucket,
    messagingSenderId:process.env.REACT_APP_messagingSenderId,
    appId:process.env.REACT_APP_appId
}

export const fbConfig = app.initializeApp(config)
export const fbAuth = fbConfig.auth()
export const fbSto = fbConfig.storage()
export const fbFs = fbConfig.firestore()
// export const fbMsg = fbConfig.messaging()

console.log('Firebase initalization..............')


// const providers = {
//     googleProvider: new firebase.auth.GoogleAuthProvider(),
// };
// export default withFirebaseAuth({
//     providers,
//     firebaseAppAuth,
// })(App);

