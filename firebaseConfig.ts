import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDhBnNd-wNFpIKmpbjXuWWLOWs8MGb5FxI",
  authDomain: "egg-bre.firebaseapp.com",
  projectId: "egg-bre",
  storageBucket: "egg-bre.firebasestorage.app",
  messagingSenderId: "771361433300",
  appId: "1:771361433300:web:c0e09bfb222a7fddf57d41",
  measurementId: "G-46KF2YXF3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const isFirebaseReady = true;