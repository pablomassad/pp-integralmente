import {fb, ui} from "../"
import firebase from "../../firebase"

const login = payload => {
	return async dispatch => {
		try {
			dispatch(ui.showLoader(true))
			await firebase.login(payload.email, payload.password)
			dispatch(
				ui.showMessage({
					msg: "Bienvenido a Integralmente!",
					type: "success",
				})
			)
			const user = await firebase.getCurrentUser()
			const userInfo = await getUserInfo(user.uid)
			await updateUserInfo(userInfo)
			dispatch(
				fb.setUser({
					userInfo,
				})
			)
		} catch (error) {
			dispatch(
				ui.showMessage({
					msg: error.message,
					type: "error",
				})
			)
		} finally {
			dispatch(ui.showLoader(false))
		}
	}
}
const getAllPatients = () => {
	return async (dispatch, getState) => {
		dispatch(ui.showLoader(true))
		const dsn = await firebase.db.collection("pacientes").get()
		const patients = dsn.docs.map(x => x.data())
		dispatch(
			fb.setPatients({
				patients,
			})
		)
		dispatch(ui.showLoader(false))
	}
}
const getPatients = () => {
	return async (dispatch, getState) => {
		dispatch(ui.showLoader(true))
		const userInfo = getState().fb.userInfo
		const dsn = await firebase.db
			.collection("pacientes")
			.where("uid", "==", userInfo.id)
			.get()
		const patients = dsn.docs.map(x => x.data())
		dispatch(
			fb.setPatients({
				patients,
			})
		)
		dispatch(ui.showLoader(false))
	}
}
const getFacturas = () => async (dispatch, getState) => {
	dispatch(ui.showLoader(true))
	const userInfo = getState().fb.userInfo
	const dsn = await firebase.db
		.collection("facturas")
		.where("uid", "==", userInfo.id)
		.get()
	const facturas = dsn.docs.map(x => {
		return {
			...x.data(),
			...{
				id: x.id,
			},
		}
	})
	dispatch(
		fb.setFacturas({
			facturas,
		})
	)
	dispatch(ui.showLoader(false))
	return true
}
const updatePatient = (id, patient) => async dispatch => {
	dispatch(ui.showLoader(true))
	await firebase.db.collection("pacientes").doc(id).set(patient, {
		merge: true,
	})
	dispatch(
		fb.setPatient({
			patient,
		})
	)
	dispatch(ui.showLoader(false))
}
const removePatient = payload => async dispatch => {
	//await firebase.db.collection('pacientes').doc(payload.id).delete()
	getPatients()
}
const updateFactura = (id, factura) => async dispatch => {
	debugger
	await firebase.db.doc(`facturas/${id}`).set(factura, {
		merge: true,
	})
	getFacturas()
}
const removeFactura = payload => {
	return async dispatch => {
		//await firebase.db.collection('facturas').doc(payload.id).delete()
		getFacturas()
	}
}
const deleteFileStorage = (path, filename) => async dispatch => {
	
}
const uploadFileStorage = (path, file) => async dispatch => {
	const uploadTask = firebase.sto.ref(path + "/" + file.name).put(file)
	uploadTask.on(
		"state_changed",
		snapshot => {},
		error => {
			console.log(error)
		},
		async () => {
			const url = await firebase.sto.ref(path).child(file.name).getDownloadURL()
            console.log('url file: ', url)
		}
	)
}

///////////////////////////////////////
// Private functions
///////////////////////////////////////
const getUserInfo = async id => {
	const dsn = await firebase.db.doc(`users/${id}`).get()
	const user = dsn.data()
	user["id"] = id
	return user
}
const updateUserInfo = async usr => {
	usr.lastLogin = new Date().getTime()
	usr.lastLoginStr = usr.lastLogin
	//   const obj = JSON.parse(JSON.stringify(usr))
	await firebase.db.doc(`users/${usr.id}`).set(usr, {
		merge: true,
	})
}

export const bl = {
	login,
	getUserInfo,
	updateUserInfo,
	getAllPatients,
	getPatients,
	updatePatient,
	removePatient,
	getFacturas,
	updateFactura,
	removeFactura,
    deleteFileStorage,
    uploadFileStorage
}
