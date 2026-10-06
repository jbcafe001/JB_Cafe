import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole, ApiResponse } from '../types';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  requiresPasswordChange?: boolean;
}

const getFriendlyErrorMessage = (code: string) => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'Your account has been disabled. Contact admin.';
    default:
      return 'An unexpected error occurred during login.';
  }
};

export const loginUser = async (email: string, password: string): Promise<ApiResponse<AppUser>> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const appUser: AppUser = {
        uid: user.uid,
        email: user.email!,
        name: userDoc.data().name,
        role: userDoc.data().role,
        requiresPasswordChange: userDoc.data().requiresPasswordChange ?? false,
      };

      return {
        message: 'Login successful',
        status: 200,
        toast: true,
        data: appUser
      };
    } else {
      throw {
        message: 'User record not found in database.',
        status: 404,
        toast: true
      };
    }
  } catch (error: any) {
    // If it's already an ApiResponse structure, just rethrow
    if (error.status) throw error;
    
    // Format Firebase errors
    throw {
      message: getFriendlyErrorMessage(error.code),
      status: 401,
      toast: true
    };
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
