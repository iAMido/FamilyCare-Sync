import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { notifyUsers, notifyAllFamily } from './helpers/fcmHelper';
import dayjs from 'dayjs';

// Runs every 15 minutes. Checks if any treatment preset reminder should fire.
export const scheduledReminders = onSchedule('every 15 minutes', async () => {
  const db = getFirestore();
  const now = dayjs();

  // Fetch presets map once
  const presetsSnap = await db.collection('presets').get();
  const presetsMap: Record<string, { automatedReminders: Array<{ offsetHours: number; message: string }> }> = {};
  presetsSnap.forEach((d) => { presetsMap[d.id] = d.data() as any; });

  // Only look at scheduled upcoming treatments
  const treatmentsSnap = await db
    .collection('treatments')
    .where('status', '==', 'scheduled')
    .get();

  const batch = db.batch();
  let didWrite = false;

  for (const doc of treatmentsSnap.docs) {
    const data = doc.data();
    const dateTime = data.dateTime instanceof Timestamp ? dayjs(data.dateTime.toDate()) : null;
    if (!dateTime) continue;

    const preset = presetsMap[data.presetId];
    if (!preset?.automatedReminders?.length) continue;

    const sentOffsets: number[] = data.sentReminderOffsets ?? [];

    for (const reminder of preset.automatedReminders) {
      if (sentOffsets.includes(reminder.offsetHours)) continue;

      const triggerTime = dateTime.add(reminder.offsetHours, 'hour');
      const diffMinutes = triggerTime.diff(now, 'minute');

      // Fire if within this 15-minute window (0..15 minutes from now in the past)
      if (diffMinutes >= -15 && diffMinutes <= 0) {
        const uidsToNotify = [
          ...(data.escortId ? [data.escortId] : []),
          ...(data.patientId ? [data.patientId] : []),
        ];

        if (uidsToNotify.length) {
          await notifyUsers(uidsToNotify, '🔔 FamilyCare Reminder', reminder.message, {
            treatmentId: doc.id,
            screen: 'TreatmentDetail',
          });
        } else {
          await notifyAllFamily('🔔 FamilyCare Reminder', reminder.message, {
            treatmentId: doc.id,
          });
        }

        batch.update(doc.ref, {
          sentReminderOffsets: FieldValue.arrayUnion(reminder.offsetHours),
        });
        didWrite = true;
      }
    }
  }

  if (didWrite) await batch.commit();
});
