import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { requestNotificationPermissions } from '../services/notificationService';
import { AppUser } from '../types/User';

export function useNotifications(user: AppUser | null) {
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    if (!user || Platform.OS === 'web') return;

    (async () => {
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      const Notifications = require('expo-notifications');
      const token = await Notifications.getExpoPushTokenAsync().catch(() => null);
      if (token?.data) {
        await updateDoc(doc(db, 'users', user.uid), { fcmToken: token.data });
      }

      listenerRef.current = Notifications.addNotificationReceivedListener(() => {});
    })();

    return () => { listenerRef.current?.remove(); };
  }, [user?.uid]);
}
