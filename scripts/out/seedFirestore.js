"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Seeds Firestore with real presets and known appointments.
 *
 * Setup:
 *   1. Save your Google Service Account JSON as service-account.json in the project root
 *   2. npm install -D ts-node
 *   3. npx ts-node scripts/seedFirestore.ts
 */
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const path = __importStar(require("path"));
const app = (0, app_1.initializeApp)({
    credential: (0, app_1.cert)(path.resolve(__dirname, '../../service-account.json')),
    projectId: 'familycare-sync',
});
const db = (0, firestore_1.getFirestore)(app);
// ── Presets ───────────────────────────────────────────────────────────────────
const presets = [
    {
        id: 'karna',
        name: 'טיפול הקרנה',
        defaultLocation: 'מכון רדיותרפיה',
        icon: '☢️',
        automatedReminders: [
            { offsetHours: -24, message: 'תזכורת: טיפול הקרנה מחר' },
            { offsetHours: -2, message: 'טיפול הקרנה בעוד שעתיים – התכוננות לצאת' },
        ],
    },
    {
        id: 'chemo',
        name: 'טיפול כימו',
        defaultLocation: 'מחלקת אונקולוגיה',
        icon: '💉',
        automatedReminders: [
            { offsetHours: -48, message: 'תזכורת: נדרשת בדיקת דם היום לפני הכימו בעוד יומיים' },
            { offsetHours: -2, message: 'טיפול כימו בעוד שעתיים – בדוק שיש ליווי' },
        ],
    },
    {
        id: 'blood-test',
        name: 'בדיקת דם',
        defaultLocation: 'מעבדה, קומה 1',
        icon: '🩸',
        automatedReminders: [
            { offsetHours: -12, message: 'בדיקת דם מחר בבוקר – צום מחצות' },
            { offsetHours: -1, message: 'בדיקת דם בעוד שעה' },
        ],
    },
    {
        id: 'injection',
        name: 'תור לקבלת זריקה',
        defaultLocation: 'מרפאה חוץ',
        icon: '💊',
        automatedReminders: [
            { offsetHours: -2, message: 'זריקה בעוד שעתיים' },
        ],
    },
    {
        id: 'oncologist',
        name: 'תור לאונקולוג',
        defaultLocation: 'מרפאת אונקולוגיה',
        icon: '🩺',
        automatedReminders: [
            { offsetHours: -24, message: 'תור לאונקולוג מחר – הכינו שאלות ועדכוני מצב' },
            { offsetHours: -2, message: 'תור לאונקולוג בעוד שעתיים' },
        ],
    },
    {
        id: 'nurse',
        name: 'אחות מתאמת',
        defaultLocation: 'מרכז רפואי',
        icon: '👩‍⚕️',
        automatedReminders: [
            { offsetHours: -24, message: 'פגישה עם האחות המתאמת מחר' },
        ],
    },
    {
        id: 'radiation-sim',
        name: 'סימולציה קרינה',
        defaultLocation: 'מכון רדיותרפיה',
        icon: '🔬',
        automatedReminders: [
            { offsetHours: -24, message: 'סימולציה לקרינה מחר – הגיעו בזמן' },
            { offsetHours: -2, message: 'סימולציה קרינה בעוד שעתיים' },
        ],
    },
    {
        id: 'radiotherapy',
        name: 'מכון רדיותרפיה',
        defaultLocation: 'מכון רדיותרפיה',
        icon: '🏥',
        automatedReminders: [
            { offsetHours: -2, message: 'טיפול במכון רדיותרפיה בעוד שעתיים' },
        ],
    },
];
// ── Known upcoming treatments ─────────────────────────────────────────────────
// Times are Israel Standard Time (UTC+3 in summer)
function israelTime(year, month, day, hour, minute) {
    // Israel summer time = UTC+3
    const utcMs = Date.UTC(year, month - 1, day, hour - 3, minute);
    return firestore_1.Timestamp.fromMillis(utcMs);
}
const treatments = [
    {
        id: 'treat-nurse-may11',
        presetId: 'nurse',
        title: 'אחות מתאמת',
        location: 'מרכז רפואי',
        dateTime: israelTime(2026, 5, 11, 11, 0),
        escortId: null,
        status: 'scheduled',
        summary: null,
        calendarEventId: null,
    },
    {
        id: 'treat-radiotherapy-may18',
        presetId: 'radiotherapy',
        title: 'מכון רדיותרפיה',
        location: 'מכון רדיותרפיה',
        dateTime: israelTime(2026, 5, 18, 15, 30),
        escortId: null,
        status: 'scheduled',
        summary: null,
        calendarEventId: null,
    },
    {
        id: 'treat-radiation-sim-may20',
        presetId: 'radiation-sim',
        title: 'סימולציה קרינה',
        location: 'מכון רדיותרפיה',
        dateTime: israelTime(2026, 5, 20, 16, 30),
        escortId: null,
        status: 'scheduled',
        summary: null,
        calendarEventId: null,
    },
    {
        id: 'treat-oncologist-jun22',
        presetId: 'oncologist',
        title: 'תור לאונקולוג',
        location: 'מרפאת אונקולוגיה',
        dateTime: israelTime(2026, 6, 22, 15, 40),
        escortId: null,
        status: 'scheduled',
        summary: null,
        calendarEventId: null,
    },
];
// ── Run ───────────────────────────────────────────────────────────────────────
async function seed() {
    console.log('Seeding presets...');
    for (const preset of presets) {
        await db.collection('presets').doc(preset.id).set(preset);
        console.log(`  ✅ ${preset.name}`);
    }
    console.log('\nSeeding treatments...');
    for (const treatment of treatments) {
        await db.collection('treatments').doc(treatment.id).set(treatment);
        console.log(`  ✅ ${treatment.title} — ${treatment.dateTime.toDate().toLocaleString('he-IL')}`);
    }
    console.log('\n🎉 Done!');
    process.exit(0);
}
seed().catch((err) => { console.error(err); process.exit(1); });
