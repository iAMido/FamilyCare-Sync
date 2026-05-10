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
    const treatmentId = event.params.treatmentId;
    logger.info(`onTreatmentCreate fired for ${treatmentId}`);

    const data = event.data?.data();
    if (!data) {
      logger.warn(`No data for treatment ${treatmentId}`);
      return;
    }

    const treatment: TreatmentData = {
      id: treatmentId,
      title: data.title,
      location: data.location,
      dateTime: data.dateTime as Timestamp,
      escortId: data.escortId ?? null,
    };

    const db = getFirestore();
    const ref = db.collection('treatments').doc(treatmentId);
    const dt = dayjs(treatment.dateTime.toDate());

    // 1. Send email FIRST — most reliable step
    try {
      logger.info(`Sending family email for treatment ${treatmentId}`);
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
      logger.info(`Email sent for treatment ${treatmentId}`);
    } catch (err) {
      logger.error(`Email send failed for ${treatmentId}`, err);
    }

    // 2. Create Google Calendar event
    try {
      logger.info(`Creating calendar event for treatment ${treatmentId}`);
      const calendarEventId = await createCalendarEvent(treatment, GOOGLE_SA_KEY.value());
      await ref.update({ calendarEventId });
      logger.info(`Calendar event created: ${calendarEventId} for treatment ${treatmentId}`);
    } catch (err) {
      logger.error(`Calendar sync failed for ${treatmentId}`, err);
    }

    // 3. Push notification — least critical, always wrapped
    try {
      await notifyAllFamily(
        '📅 תור חדש נקבע',
        `${treatment.title} — ${dt.format('dddd, D MMM')} בשעה ${dt.format('HH:mm')}`,
        { treatmentId: treatment.id, screen: 'TreatmentDetail' }
      );
    } catch (err) {
      logger.error(`FCM notification failed for ${treatmentId}`, err);
    }

    logger.info(`onTreatmentCreate complete for ${treatmentId}`);
  }
);
