import app from 'firebase/app'
import "firebase/auth"
import "firebase/storage"
import "firebase/messaging"
import "firebase/firebase-firestore"

import {cfg} from './firebase-config'

const fb = app.initializeApp(cfg)

export const fbAuth = fb.auth()
export const fbMsg = fb.messaging()
export const fbSto = fb.storage()
export const fbFs = fb.firestore()

