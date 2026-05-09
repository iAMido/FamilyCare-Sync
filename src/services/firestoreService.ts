import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Treatment, TreatmentStatus } from '../types/Treatment';
import { Preset } from '../types/Preset';
import { Contact } from '../types/Contact';
import { AppUser } from '../types/User';

// ── Helpers ──────────────────────────────────────────────────────────────────

function treatmentFromFirestore(id: string, data: Record<string, any>): Treatment {
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
    protocolGroupId: data.protocolGroupId ?? null,
    protocolRole: data.protocolRole ?? undefined,
    cycleNumber: data.cycleNumber ?? null,
    cycleTotal: data.cycleTotal ?? null,
    sideEffects: data.sideEffects ?? [],
  };
}

// ── Treatments ────────────────────────────────────────────────────────────────

export async function createTreatment(
  data: Omit<Treatment, 'id' | 'status' | 'calendarEventId' | 'createdAt'>
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

/**
 * Create a main appointment + all its protocol step appointments atomically.
 * Returns the main appointment ID.
 */
export async function createProtocolGroup(
  main: Omit<Treatment, 'id' | 'status' | 'calendarEventId' | 'createdAt'>,
  steps: Array<Omit<Treatment, 'id' | 'status' | 'calendarEventId' | 'createdAt'>>
): Promise<string> {
  // Use a client-side UUID for the group
  const groupId = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const mainWithGroup: typeof main = {
    ...main,
    protocolGroupId: groupId,
    protocolRole: 'main',
  };
  const mainId = await createTreatment(mainWithGroup);

  for (const step of steps) {
    await createTreatment({
      ...step,
      protocolGroupId: groupId,
      protocolRole: 'step',
    });
  }

  return mainId;
}

export async function updateTreatment(id: string, patch: Partial<Treatment>): Promise<void> {
  const ref = doc(db, 'treatments', id);
  const { id: _id, ...rest } = patch as any;
  await updateDoc(ref, rest);
}

export async function getTreatmentById(id: string): Promise<Treatment | null> {
  const snap = await getDoc(doc(db, 'treatments', id));
  if (!snap.exists()) return null;
  return treatmentFromFirestore(snap.id, snap.data());
}

// ── Presets ───────────────────────────────────────────────────────────────────

export async function getPresets(): Promise<Preset[]> {
  const snap = await getDocs(collection(db, 'presets'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Preset, 'id'>) }));
}

export async function createPreset(data: Omit<Preset, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'presets'), data);
  return ref.id;
}

export async function updatePreset(id: string, data: Omit<Preset, 'id'>): Promise<void> {
  await setDoc(doc(db, 'presets', id), data);
}

export async function deletePreset(id: string): Promise<void> {
  await deleteDoc(doc(db, 'presets', id));
}

// ── Contacts ──────────────────────────────────────────────────────────────────

function contactFromFirestore(id: string, data: Record<string, any>): Contact {
  return {
    id,
    name: data.name ?? '',
    role: data.role ?? 'other',
    phone: data.phone ?? undefined,
    email: data.email ?? undefined,
    hospital: data.hospital ?? undefined,
    department: data.department ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
  };
}

export async function getContacts(): Promise<Contact[]> {
  const snap = await getDocs(query(collection(db, 'contacts'), orderBy('name')));
  return snap.docs.map((d) => contactFromFirestore(d.id, d.data()));
}

export async function createContact(data: Omit<Contact, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'contacts'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateContact(id: string, data: Omit<Contact, 'id' | 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'contacts', id), data, { merge: true });
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id));
}

// ── Users ─────────────────────────────────────────────────────────────────────

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
