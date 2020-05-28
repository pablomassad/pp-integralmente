import firebase from 'firebase'
import config from './firebase-config'

import {Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed} from '@capacitor/core'

const {PushNotifications} = Plugins
const INITIAL_STATE = {
	notifications: [{id: 'id', title: 'Test Push', body: 'This is my first push notification'}]
}

console.log('CONFIG:', config)
firebase.initializeApp(config)

export const pushing = () => {
	try {
		push()
	} catch (error) {
		const messaging = firebase.messaging()
		messaging
			.requestPermission()
			.then(() => {
				return messaging.getToken()
			})
			.then(token => {
				console.log('token:', token)
			})
			.catch(err => {
				console.log('error: ', err)
			})
	}
}

const push = () => {
    const [notifications, setNotifications] = useState(INITIAL_STATE)

	// Register with Apple / Google to receive push via APNS/FCM
	PushNotifications.register()

	// On succcess, we should be able to receive notifications
	PushNotifications.addListener('registration', token => {
		alert('Push registration success, token: ' + token.value)
	})

	// Some issue with your setup and push will not work
	PushNotifications.addListener('registrationError', error => {
		alert('Error on registration: ' + JSON.stringify(error))
	})

	// Show us the notification payload if the app is open on our device
	PushNotifications.addListener('pushNotificationReceived', notification => {
		let notif = notifications
		notif.push({
			id: notification.id,
			title: notification.title,
			body: notification.body
		})
		setNotifications(notif)
	})

	// Method called when tapping on a notification
	PushNotifications.addListener('pushNotificationActionPerformed', notification => {
		let notif = notifications
		notif.push({
			id: notification.notification.data.id,
			title: notification.notification.data.title,
			body: notification.notification.data.body
		})
		setNotifications(notif)
	})
}

export default firebase
