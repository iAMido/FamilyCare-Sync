/**
 * Run once to seed initial Preset documents in Firestore.
 *
 * Usage:
 *   1. Install ts-node: npm install -g ts-node
 *   2. Create a .env file with EXPO_PUBLIC_FIREBASE_* vars
 *   3. ts-node scripts/seedFirestore.ts
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

const presets = [
  {
    id: 'chemo',
    name: 'Chemotherapy',
    defaultLocation: 'Oncology Department, Floor 3',
    icon: '💉',
    automatedReminders: [
      { offsetHours: -48, message: 'Blood tests required today for Thursday\'s chemo session' },
      { offsetHours: -2, message: 'Chemo session in 2 hours — heading to hospital soon' },
    ],
  },
  {
    id: 'blood-test',
    name: 'Blood Test',
    defaultLocation: 'Lab, Floor 1',
    icon: '🩸',
    automatedReminders: [
      { offsetHours: -12, message: 'Blood test tomorrow — fast from midnight' },
      { offsetHours: -1, message: 'Blood test in 1 hour' },
    ],
  },
  {
    id: 'doctor-consult',
    name: 'Doctor Consult',
    defaultLocation: 'Outpatient Clinic',
    icon: '🩺',
    automatedReminders: [
      { offsetHours: -24, message: 'Doctor consultation tomorrow — prepare questions' },
    ],
  },
  {
    id: 'radiation',
    name: 'Radiation Therapy',
    defaultLocation: 'Radiotherapy Center, Floor B1',
    icon: '☢️',
    automatedReminders: [
      { offsetHours: -2, message: 'Radiation session in 2 hours' },
    ],
  },
];

async function seed() {
  for (const preset of presets) {
    await setDoc(doc(db, 'presets', preset.id), preset);
    console.log(`✅ Seeded preset: ${preset.name}`);
  }
  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
