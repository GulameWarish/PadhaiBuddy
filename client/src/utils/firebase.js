
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "padhaibuddy-9239b.firebaseapp.com",
  projectId: "padhaibuddy-9239b",
  storageBucket: "padhaibuddy-9239b.firebasestorage.app",
  messagingSenderId: "522296528047",
  appId: "1:522296528047:web:89fdc318dad5119060585a"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth , provider}