import React from 'react'
import ReactDOM from 'react-dom'

import {BrowserRouter as Router} from 'react-router-dom'

import {Provider} from 'react-redux'
import store from './redux/store'

import GlobalStyles from './global-styles'
import {ToastProvider} from 'react-toast-notifications'

import App from './App'
import * as serviceWorker from './serviceWorker'

const nodes = (
    <Provider store={store}>
        <GlobalStyles />
        <ToastProvider placement="bottom-center">
            <Router>
                <App />
            </Router>
        </ToastProvider>
    </Provider>
)
ReactDOM.render(nodes, document.getElementById('root'))
serviceWorker.register()
