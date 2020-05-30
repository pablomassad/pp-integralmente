import {createAction} from 'redux-actions'

const addNotification = createAction('fb.addNotification')
const setToken = createAction('fb.setToken')
const setWebToken = createAction('fb.setWebToken')
const setUser = createAction('fb.setUser')
const setPatients = createAction('fb.setPatients')
const setPatient = createAction('fb.setPatient')
const setFacturas = createAction('fb.setFacturas')
const setFactura = createAction('fb.setFactura')
const setSessions = createAction('fb.setSessions')
const setSession = createAction('fb.setSession')
const setAttachments = createAction('fb.setAttachments')

const fetchUserRequest = createAction('fetchUserRequest')
const fetchUserSuccess = createAction('fetchUserSuccess')
const fetchUserFailure = createAction('fetchUserFailure')
const fetchUsers = () => {
	return dispatch => {
		dispatch(fetchUserRequest())
		// axios.get('https://jsonplaceholder.typicode.com/users')
		//     .then(res =>
		//     {
		//         const users = res.data.map(usr=>usr.id)
		//         dispatch(fetchUserSuccess(users))
		//     })
		//     .catch(err =>
		//     {
		//         dispatch(fetchUserFailure(err.message))
		//     })
	}
}

export const fb = {
    addNotification,
    setToken,
    setWebToken,
	setUser,
	setPatients,
	setPatient,
	setFacturas,
	setFactura,
    setSessions,
    setSession,
    setAttachments
}
