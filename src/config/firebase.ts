import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQxYkZkzAIpjIWShalFvddSWj2kWRFH8c",
  authDomain: "tomnet-counter.firebaseapp.com",
  databaseURL: "https://tomnet-counter-default-rtdb.firebaseio.com",
  projectId: "tomnet-counter",
  storageBucket: "tomnet-counter.firebasestorage.app",
  messagingSenderId: "955399981396",
  appId: "1:955399981396:web:098fa28320efe747a060c1",
  measurementId: "G-TNSLHQXZF4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
