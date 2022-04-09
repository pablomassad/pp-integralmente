import {createStore, applyMiddleware, combineReducers} from 'redux'

import fb from './reducers/fbReducer'
import ui from './reducers/uiReducer'

import {composeWithDevTools} from 'redux-devtools-extension'
// import {logger} from 'redux-logger'
import thunk from 'redux-thunk'

// import {reduxFirestore, getFirestore} from 'redux-firestore'
// import {reactReduxFirebase, getFirebase} from 'react-redux-firebase'
// import {fbConfig} from '../fb.service'
// import firebase from 'firebase/app'

console.log('store and reducers....')
const rootReducer = combineReducers({fb, ui})
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

// const store = createStore(rootReducer,{}, compose(
//     applyMiddleware(thunk.withExtraArgument({getFirebase, getFirestore})),
//     reactReduxFirebase(firebase,fbConfig),
//     reduxFirestore(firebase)
// ))
export default store