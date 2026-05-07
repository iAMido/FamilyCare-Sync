import * as functions from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { createCalendarEvent, GOOGLE_SA_KEY, TreatmentData } from './helpers/calendarHelper';
import { notifyAllFamily } from './helpers/fcmHelper';
import { sendFamilyEmail, RESEND_API_KEY } from './helpers/emailHelper';
import dayjs from 'dayjs';

export const onTreatmentCreate = functions.onDocumentCreated(
  { document: 'treatments/{treatmentId}', secrets: [GOOGLE_SA_KEY, RESEND_API_KEY] },
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
    const dt = dayjs(treatment.dateTime.toDate());

    // Create Google Calendar event
    try {
      const calendarEventId = await createCalendarEvent(treatment, GOOGLE_SA_KEY.value());
      await ref.update({ calendarEventId });
    } catch (err) {
      logger.error('Calendar sync failed', err);
    }

    // Push notification to all family
    await notifyAllFamily(
      '📅 תור חדש נקבע',
      `${treatment.title} — ${dt.format('dddd, D MMM')} בשעה ${dt.format('HH:mm')}`,
      { treatmentId: treatment.id, screen: 'TreatmentDetail' }
    );

    // Email all family members
    try {
      await sendFamilyEmail(
        `📅 תור חדש: ${treatment.title}`,
        `
          <b>תור חדש נוסף ל-FamilyCare Sync:</b><br/><br/>
          🏥 <b>${treatment.title}</b><br/>
          📅 ${dt.format('dddd, D MMMM YYYY')}<br/>
          🕐 ${dt.format('HH:mm')}<br/>
          📍 ${treatment.location}
        `,
        RESEND_API_KEY.value()
      );
    } catch (err) {
      logger.error('Email send failed', err);
    }
  }
);
