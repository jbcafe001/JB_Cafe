import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

export const loginUser = async (email: string, password: string): Promise<AppUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Fetch role from Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return {
      uid: user.uid,
      email: user.email!,
      ...userDoc.data()
    } as AppUser;
  } else {
    throw new Error("User record not found in database.");
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const createDemoUsers = async () => {
  const demoUsers = [
    { email: 'admin@cafe.com', password: 'password123', name: 'Admin User', role: 'admin' as UserRole },
    { email: 'cook@cafe.com', password: 'password123', name: 'Head Cook', role: 'cook' as UserRole },
    { email: 'waiter@cafe.com', password: 'password123', name: 'Rahul Waiter', role: 'waiter' as UserRole },
    { email: 'other@cafe.com', password: 'password123', name: 'Other Staff', role: 'others' as UserRole },
  ];

  for (const u of demoUsers) {
    try {
      let uid = '';
      try {
        const userCred = await createUserWithEmailAndPassword(auth, u.email, u.password);
        uid = userCred.user.uid;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          const loginCred = await signInWithEmailAndPassword(auth, u.email, u.password);
          uid = loginCred.user.uid;
        } else {
          throw authError;
        }
      }
      
      await setDoc(doc(db, 'users', uid), {
        name: u.name,
        role: u.role,
        email: u.email
      });
      console.log(`Created/Updated user: ${u.email}`);
    } catch (e: any) {
      console.error(`Error processing user ${u.email}:`, e);
      throw e;
    }
  }
};
