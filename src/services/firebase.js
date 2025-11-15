// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWOZMj1FeMGEhvU4lzDBOhQ6Tti0B7upQ",
  authDomain: "rps64-63d8d.firebaseapp.com",
  projectId: "rps64-63d8d",
  storageBucket: "rps64-63d8d.firebasestorage.app",
  messagingSenderId: "152612389065",
  appId: "1:152612389065:web:1fbead59ee23a820214d18",
  measurementId: "G-4PZSXVSQV3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Optional debugging
window.auth = auth;
