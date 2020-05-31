import app from 'firebase/app'
import "firebase/auth"
import "firebase/storage"
// import "firebase/messaging"
import "firebase/firebase-firestore"

import {config} from './firebase-config'

export const fbConfig = app.initializeApp(config)
export const fbAuth = fbConfig.auth()
// export const fbMsg = fbConfig.messaging()
export const fbSto = fbConfig.storage()
export const fbFs = fbConfig.firestore()

console.log('Firebase initalization..............')

