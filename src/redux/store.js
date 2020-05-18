import {createStore, applyMiddleware} from 'redux'
import {combineReducers} from 'redux'

import fb from './reducers/fbReducer'
import ui from './reducers/uiReducer'

import {composeWithDevTools} from 'redux-devtools-extension'
import {logger} from 'redux-logger'
import thunk from 'redux-thunk'


console.log('store and reducers....')
const rootReducer = combineReducers({fb, ui})
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk,logger)))
export default store