import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUm4lKOrEMD2NCf_OTNluVxfl_X_4XPF8",
  authDomain: "media-query-gn.firebaseapp.com",
  projectId: "media-query-gn",
  storageBucket: "media-query-gn.firebasestorage.app",
  messagingSenderId: "329944024899",
  appId: "1:329944024899:web:b8a9dc072c216b858191f6",
  measurementId: "G-M964RJ1DLQ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

export { db };
