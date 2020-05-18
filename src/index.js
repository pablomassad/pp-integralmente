import React from 'react';
import ReactDOM from 'react-dom';
import GlobalStyles from "./global-styles"

import App from './App';
import {ToastProvider} from 'react-toast-notifications'

import * as serviceWorker from './serviceWorker';

import {Provider} from 'react-redux'
import store from "./redux/store"


const nodes = (
   // <React.StrictMode>
   <Provider store={store}>
      <GlobalStyles />
      <ToastProvider>
         <App />
      </ToastProvider>
   </Provider>
   // </React.StrictMode>
)
ReactDOM.render(nodes, document.getElementById('root'))
serviceWorker.unregister();
