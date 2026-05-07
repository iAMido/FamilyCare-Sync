import * as functions from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { createCalendarEvent, GOOGLE_SA_KEY, TreatmentData } from './helpers/calendarHelper';
import { notifyAllFamily } from './helpers/fcmHelper';
import dayjs from 'dayjs';

export const onTreatmentCreate = functions.onDocumentCreated(
  { document: 'treatments/{treatmentId}', secrets: [GOOGLE_SA_KEY] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const treatment: TreatmentData = {
      id: event.params.treatmentId,
      title: data.title,
      location: data.location,
      dateTime: data.dateTime as Timestamp,
      escortId: data.escortId,
    };

    const db = getFirestore();
    const ref = db.collection('treatments').doc(treatment.id);

    // Create Google Calendar event
    try {
      const saKey = GOOGLE_SA_KEY.value();
      const calendarEventId = await createCalendarEvent(treatment, saKey);
      await ref.update({ calendarEventId });
    } catch (err) {
      logger.error('Calendar sync failed', err);
    }

    // Notify all family members
    const dt = dayjs(treatment.dateTime.toDate());
    await notifyAllFamily(
      '📅 New appointment scheduled',
      `${treatment.title} on ${dt.format('dddd, D MMM')} at ${dt.format('HH:mm')}`,
      { treatmentId: treatment.id, screen: 'TreatmentDetail' }
    );
  }
);
