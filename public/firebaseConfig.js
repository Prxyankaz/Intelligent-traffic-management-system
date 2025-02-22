// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDZhTQHy-pI2-8FkewsgkNYPkXKIU5jY00",
    authDomain: "trafficmanagementsystem-dfb3e.firebaseapp.com",
    projectId: "trafficmanagementsystem-dfb3e",
    storageBucket: "trafficmanagementsystem-dfb3e.firebasestorage.app",
    messagingSenderId: "1095767209218",
    appId: "1:1095767209218:web:7dbbec59d2318537f2be1b"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, setDoc, doc };
