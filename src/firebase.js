// Firebase configuration — โปรเจกต์ collection-employees
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBAAQ2TXVuj8U9QuNQTwYAQhOOkLVz-vBs",
  authDomain: "collection-employees.firebaseapp.com",
  projectId: "collection-employees",
  storageBucket: "collection-employees.firebasestorage.app",
  messagingSenderId: "637645367734",
  appId: "1:637645367734:web:d2346de4426b3843a57917",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
