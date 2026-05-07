import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { requestNotificationPermissions } from '../services/notificationService';
import { AppUser } from '../types/User';

export function useNotifications(user: AppUser | null) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      const token = await Notifications.getExpoPushTokenAsync();
      if (token.data) {
        await updateDoc(doc(db, 'users', user.uid), { fcmToken: token.data });
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Foreground notification received - handled by setNotificationHandler
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, [user?.uid]);
}
