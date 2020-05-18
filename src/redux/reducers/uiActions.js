import {createAction} from 'redux-actions'

const toggleSidebar = createAction('ui.toggleSidebar')
const showMessage = createAction('ui.showMessage')
const showLoader = createAction('ui.showLoader')


export const ui = {
    toggleSidebar,
    showMessage,
    showLoader
}