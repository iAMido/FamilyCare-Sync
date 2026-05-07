import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Treatment, TreatmentStatus } from '../types/Treatment';
import { AppUser } from '../types/User';

// ── Treatments ──────────────────────────────────────────────────────────────

function fromFirestore(id: string, data: Record<string, any>): Treatment {
  return {
    id,
    presetId: data.presetId ?? '',
    title: data.title ?? '',
    location: data.location ?? '',
    dateTime: data.dateTime instanceof Timestamp ? data.dateTime.toDate() : new Date(data.dateTime),
    escortId: data.escortId ?? null,
    status: data.status ?? 'scheduled',
    summary: data.summary ?? null,
    calendarEventId: data.calendarEventId ?? null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    createdBy: data.createdBy,
  };
}

export async function createTreatment(
  data: Omit<Treatment, 'id' | 'status' | 'calendarEventId' | 'createdAt'> & { createdBy: string }
): Promise<string> {
  const ref = await addDoc(collection(db, 'treatments'), {
    ...data,
    status: 'scheduled' as TreatmentStatus,
    calendarEventId: null,
    summary: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTreatment(id: string, patch: Partial<Treatment>): Promise<void> {
  const ref = doc(db, 'treatments', id);
  const { id: _id, ...rest } = patch as any;
  await updateDoc(ref, rest);
}

export async function getTreatmentById(id: string): Promise<Treatment | null> {
  const snap = await getDoc(doc(db, 'treatments', id));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data());
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getFamilyMembers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AppUser, 'uid'>) }));
}

export async function upsertUser(user: AppUser): Promise<void> {
  await updateDoc(doc(db, 'users', user.uid), {
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    ...(user.fcmToken ? { fcmToken: user.fcmToken } : {}),
  });
}
