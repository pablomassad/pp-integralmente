import app from 'firebase/app'
import "firebase/auth"
import "firebase/firebase-firestore"
import config from './firebase-config'


class Firebase
{
    constructor()
    {
        console.log(config)
        app.initializeApp(config)
        this.auth = app.auth()
        this.db = app.firestore()
    }

    login(email, password)
    {
        return this.auth.signInWithEmailAndPassword(email, password)
    }
    logout(email, password)
    {
        return this.auth.signOut()
    }
    async register(name, email, password)
    {
        await this.auth.createUserWithEmailAndPassword(email, password)
        return this.auth.currentUser.updateProfile({displayName: name})
    }
    addQuote(quote)
    {
        if (!this.auth.currentUser) {
            return alert('Not Authorized')
        }
        return this.db.doc(`usersX/${this.auth.currentUser.id}`).set({quote})
    }
    isInitialized()
    {
        return new Promise((resolve, reject) =>
        {
            this.auth.onAuthStateChanged(x=>{
                resolve(true)
            })
        })
    }
    async getCurrentUser()
    {
        return this.auth.currentUser
    }
    async getCurrentUserQuote()
    {
        const quote = await this.db.doc(`usersX/${this.auth.currentUser.uid}`).get()
        return quote.get('quote')
    }
}

export default new Firebase()
