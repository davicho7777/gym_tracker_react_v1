// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCgJgBdeBOnUUlsmKIdC4BN0UkPWCs5ofk",

    authDomain: "gymtracker-75ceb.firebaseapp.com",
  
    projectId: "gymtracker-75ceb",
  
    storageBucket: "gymtracker-75ceb.firebasestorage.app",
  
    messagingSenderId: "443566254758",
  
    appId: "1:443566254758:web:f1dbac363815ff224f6267",
  
    measurementId: "G-4JF5ZY4D36"
  
};

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app); // Añade este log
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };