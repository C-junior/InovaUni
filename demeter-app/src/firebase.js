// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABmBDKNYOQxqx2Aa4wb9ot9dLace-JU2c",
  authDomain: "demeter-b1a19.firebaseapp.com",
  projectId: "demeter-b1a19",
  storageBucket: "demeter-b1a19.firebasestorage.app",
  messagingSenderId: "330961491725",
  appId: "1:330961491725:web:b676740cf38e105915c244",
  measurementId: "G-0DJ01LNMTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;