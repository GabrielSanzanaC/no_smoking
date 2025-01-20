// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDc6ru4ga2NCaNmvDyq5bWPBA2Ao1Dofwc",
  authDomain: "app-nosmoking.firebaseapp.com",
  projectId: "app-nosmoking",
  storageBucket: "app-nosmoking.firebasestorage.app",
  messagingSenderId: "571745550303",
  appId: "1:571745550303:web:16a804fc73467d9f160e6a",
  measurementId: "G-MDD41D6QB8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);