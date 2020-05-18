import {createAction} from 'redux-actions'

const setUser = createAction('fb.setUser')
const setPatients = createAction('fb.setPatients')
const setPatient = createAction('fb.setPatient')
const setFacturas = createAction('fb.setFacturas')

const fetchUserRequest = createAction('fetchUserRequest')
const fetchUserSuccess = createAction('fetchUserSuccess')
const fetchUserFailure = createAction('fetchUserFailure')
const fetchUsers = () =>
{
    return (dispatch) =>
    {
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
    setUser,
    setFacturas,
    setPatients,
    setPatient
}

