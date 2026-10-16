import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, 'tables'));
  console.log('Total tables in Firestore:', snap.size);
  snap.docs.forEach(d => console.log(d.id, '->', d.data().number, '|', d.data().name));
  
  const ordSnap = await getDocs(collection(db, 'orders'));
  console.log('Total orders in Firestore:', ordSnap.size);
  ordSnap.docs.forEach(d => console.log(d.id, 'Table:', d.data().tableNumber, 'Status:', d.data().status));
  process.exit(0);
}
check();
