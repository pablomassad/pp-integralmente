import {createAction} from 'redux-actions'

const toggleSidebar = createAction('ui.toggleSidebar')
const showMessage = createAction('ui.showMessage')
const showLoader = createAction('ui.showLoader')
const setTitle = createAction('ui.setTitle')
const setDirty = createAction('ui.setDirty')


export const ui = {
	toggleSidebar,
	showMessage,
	showLoader,
    setTitle,
    setDirty
}
