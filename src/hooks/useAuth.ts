import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Linking from 'expo-linking';
import { auth, db } from '../config/firebase';
import { AppUser, UserRole } from '../types/User';
import { EMAIL_WHITELIST } from '../constants/emailWhitelist';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; error?: string }
  | { status: 'authenticated'; user: AppUser };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  // Handle magic link deep link when app is opened from email
  useEffect(() => {
    async function handleDeepLink(url: string) {
      if (!isSignInWithEmailLink(auth, url)) return;

      // Retrieve the email saved before sending the link
      const email = await getStoredEmail();
      if (!email) return;

      try {
        await signInWithEmailLink(auth, email, url);
      } catch {
        setState({ status: 'unauthenticated', error: 'link_expired' });
      }
    }

    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  }, []);

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

// Simple in-memory store for the email used to send the magic link
let _pendingEmail = '';
export function storePendingEmail(email: string) { _pendingEmail = email; }
async function getStoredEmail(): Promise<string> { return _pendingEmail; }
