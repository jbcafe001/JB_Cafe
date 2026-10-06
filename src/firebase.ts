import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary app for creating users without logging out the current admin
export const registerNewUser = async (email: string, password?: string) => {
  const secondaryAppName = "SecondaryUserCreationApp";
  const { getApps, deleteApp } = await import("firebase/app");
  
  let secondaryApp = getApps().find(a => a.name === secondaryAppName);
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }
  
  const secondaryAuth = getAuth(secondaryApp);
  const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = await import("firebase/auth");
  
  const pwd = password || "password123";
  let uid = '';

  try {
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, pwd);
    uid = userCred.user.uid;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      try {
        // Try to sign in to get the UID and update it
        const loginCred = await signInWithEmailAndPassword(secondaryAuth, email, pwd);
        uid = loginCred.user.uid;
      } catch (loginErr: any) {
        // If they provided the wrong password, send them a reset email!
        const { sendPasswordResetEmail } = await import("firebase/auth");
        await sendPasswordResetEmail(secondaryAuth, email);
        throw new Error("Email exists but password didn't match. We just sent a Password Reset Email to that address! Please check your inbox to reset it, then try adding them again with the new password.");
      }
    } else {
      throw err;
    }
  }

  await signOut(secondaryAuth);
  
  return uid;
};
