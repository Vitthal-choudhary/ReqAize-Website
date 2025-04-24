// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP4p3TAl2g_bLJ0ofqdiAyylgSL7YSO5I",
  authDomain: "reqaize-f3d6c.firebaseapp.com",
  projectId: "reqaize-f3d6c",
  storageBucket: "reqaize-f3d6c.firebasestorage.app",
  messagingSenderId: "294140736981",
  appId: "1:294140736981:web:8c30cab77dcb8bd336b95c",
  measurementId: "G-8CZQ79H2QR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics }; 