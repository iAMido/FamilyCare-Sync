import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AppUser, UserRole } from '../types/User';
import { EMAIL_WHITELIST } from '../constants/emailWhitelist';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; error?: string }
  | { status: 'authenticated'; user: AppUser };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setState({ status: 'unauthenticated' });
        return;
      }

      const email = firebaseUser.email ?? '';
      if (!EMAIL_WHITELIST.includes(email)) {
        await signOut(auth);
        setState({ status: 'unauthenticated', error: 'not_authorized' });
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const data = userDoc.data();
      const appUser: AppUser = {
        uid: firebaseUser.uid,
        email,
        displayName: data?.displayName ?? firebaseUser.displayName ?? email.split('@')[0],
        role: (data?.role as UserRole) ?? 'caregiver',
        fcmToken: data?.fcmToken,
        avatarColor: data?.avatarColor,
      };

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: appUser.email,
          displayName: appUser.displayName,
          role: appUser.role,
        });
      }

      setState({ status: 'authenticated', user: appUser });
    });

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
  }

  return { state, logout };
}
