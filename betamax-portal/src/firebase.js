import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "beta-max-core-portal-2026",
  appId: "1:400828648544:web:0e7017d7ec2d0243308705",
  storageBucket: "beta-max-core-portal-2026.firebasestorage.app",
  apiKey: "AIzaSyBPJzqQDqrbzWGVPSsmnwHs3aI0rbyJ7xU",
  authDomain: "beta-max-core-portal-2026.firebaseapp.com",
  messagingSenderId: "400828648544",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
