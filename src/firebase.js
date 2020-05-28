import firebase from 'firebase'
import config from './firebase-config'

const fb = firebase.initializeApp(config)
export default fb

