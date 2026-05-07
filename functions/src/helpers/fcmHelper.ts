import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';

async function getAllFcmTokens(): Promise<string[]> {
  const db = getFirestore();
  const snap = await db.collection('users').where('fcmToken', '!=', null).get();
  return snap.docs.map((d) => d.data().fcmToken as string).filter(Boolean);
}

async function getUserToken(uid: string): Promise<string | null> {
  const db = getFirestore();
  const doc = await db.collection('users').doc(uid).get();
  return doc.data()?.fcmToken ?? null;
}

export async function notifyAllFamily(title: string, body: string, data?: Record<string, string>): Promise<void> {
  const tokens = await getAllFcmTokens();
  if (!tokens.length) return;

  const messaging = getMessaging();
  await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  });
}

export async function notifyUsers(uids: string[], title: string, body: string, data?: Record<string, string>): Promise<void> {
  const tokens = (await Promise.all(uids.map(getUserToken))).filter(Boolean) as string[];
  if (!tokens.length) return;

  const messaging = getMessaging();
  await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  });
}
