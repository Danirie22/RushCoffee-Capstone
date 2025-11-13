import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzEay5fGB-2r5_V9UXOO8cOv-nJdHwDRg",
  authDomain: "rush-coffee.firebaseapp.com",
  projectId: "rush-coffee",
  storageBucket: "rush-coffee.firebasestorage.app",
  messagingSenderId: "423413538635",
  appId: "1:423413538635:web:ded0369f50c3a9086bd2ce"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
