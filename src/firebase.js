import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAO7Y9HaB4nS82yz560fVSgg62mYJpcggQ",
  authDomain: "focusflow-9e64a.firebaseapp.com",
  projectId: "focusflow-9e64a",
  storageBucket: "focusflow-9e64a.firebasestorage.app",
  messagingSenderId: "575114918816",
  appId: "1:575114918816:web:10e2ad54c5e9077c9602c5",
  measurementId: "G-M7YV0BLYZD",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const analytics = getAnalytics(app);