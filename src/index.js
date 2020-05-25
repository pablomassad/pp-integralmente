import React from 'react'
import ReactDOM from 'react-dom'

import {Provider} from 'react-redux'
import store from "./redux/store"

import GlobalStyles from "./global-styles"
import {ToastProvider} from 'react-toast-notifications'

import App from './App'
import * as serviceWorker from './serviceWorker';

const nodes = (
    <Provider store={store}>
        <GlobalStyles />
        <ToastProvider>
            <App />
        </ToastProvider>
    </Provider>
)
ReactDOM.render(nodes, document.getElementById('root'))
serviceWorker.unregister();
