// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtuqnkYErM_aQvdM_xyedDCYVMvKOBS6w",
  authDomain: "test-f5cee.firebaseapp.com",
  projectId: "test-f5cee",
  storageBucket: "test-f5cee.firebasestorage.app",
  messagingSenderId: "54056629861",
  appId: "1:54056629861:web:3e3aace2a5528d53a0788c",
  measurementId: "G-GDG8CQ0XLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = initializeAuth(app);