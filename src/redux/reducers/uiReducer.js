import {handleActions} from 'redux-actions'
import {ui} from './uiActions'

console.log('uiReducer....')

const initialState = {
    sidebarFlag: false,
    dirty:false,
    loading: false,
    msgInfo: undefined,
    currentTitle:''
}

export default handleActions({
    [ui.toggleSidebar]: (state, action) =>
    {
        return {...state, sidebarFlag: !state.sidebarFlag}
    },
    [ui.showMessage]: (state, action) =>
    {
        return {...state, msgInfo: {msg: action.payload.msg, type: action.payload.type}}
    },
    [ui.showLoader]: (state, action) =>
    {
        return {...state, loading: action.payload}
    },
    [ui.setTitle]: (state, action) =>
    {
        return {...state, currentTitle: action.payload}
    },
    [ui.setDirty]: (state, action) =>
    {
        return {...state, dirty: action.payload}
    }    
}, initialState)
