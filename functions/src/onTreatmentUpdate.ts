import * as functions from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { Timestamp } from 'firebase-admin/firestore';
import { updateCalendarEvent, deleteCalendarEvent, GOOGLE_SA_KEY } from './helpers/calendarHelper';
import { notifyAllFamily, notifyUsers } from './helpers/fcmHelper';
import { sendFamilyEmail, RESEND_API_KEY } from './helpers/emailHelper';
import dayjs from 'dayjs';

export const onTreatmentUpdate = functions.onDocumentUpdated(
  { document: 'treatments/{treatmentId}', secrets: [GOOGLE_SA_KEY, RESEND_API_KEY] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const calendarEventId = after.calendarEventId as string | null;
    const saKey = GOOGLE_SA_KEY.value();

    const dateChanged = (before.dateTime as Timestamp).seconds !== (after.dateTime as Timestamp).seconds;
    const locationChanged = before.location !== after.location;
    const titleChanged = before.title !== after.title;

    // Appointment rescheduled or changed
    if (calendarEventId && (dateChanged || locationChanged || titleChanged)) {
      try {
        await updateCalendarEvent(
          calendarEventId,
          {
            ...(titleChanged ? { title: after.title } : {}),
            ...(locationChanged ? { location: after.location } : {}),
            ...(dateChanged ? { dateTime: (after.dateTime as Timestamp).toDate() } : {}),
          },
          saKey
        );
      } catch (err) {
        logger.error('Calendar update failed', err);
      }

      if (dateChanged) {
        const dt = dayjs((after.dateTime as Timestamp).toDate());
        const msg = `${after.title} הוזז ל-${dt.format('D MMM')} בשעה ${dt.format('HH:mm')}`;

        await notifyAllFamily('🔄 מועד שונה', msg, {
          treatmentId: event.params.treatmentId, screen: 'TreatmentDetail',
        });

        try {
          await sendFamilyEmail(
            `🔄 שינוי מועד: ${after.title}`,
            `
              <b>מועד הטיפול שונה:</b><br/><br/>
              🏥 <b>${after.title}</b><br/>
              📅 ${dt.format('dddd, D MMMM YYYY')}<br/>
              🕐 ${dt.format('HH:mm')}<br/>
              📍 ${after.location}
            `,
            RESEND_API_KEY.value()
          );
        } catch (err) {
          logger.error('Email send failed', err);
        }
      }
    }

    // Escort assigned/changed
    if (before.escortId !== after.escortId && after.escortId) {
      await notifyUsers(
        [after.escortId],
        '✋ אתה/את המלווה',
        `אתה/את מלווה את: ${after.title}`,
        { treatmentId: event.params.treatmentId, screen: 'TreatmentDetail' }
      );
    }

    // Appointment cancelled
    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      if (calendarEventId) {
        try {
          await deleteCalendarEvent(calendarEventId, saKey);
        } catch (err) {
          logger.error('Calendar delete failed', err);
        }
      }

      await notifyAllFamily('❌ תור בוטל', `${after.title} בוטל`, {
        treatmentId: event.params.treatmentId,
      });

      try {
        await sendFamilyEmail(
          `❌ תור בוטל: ${after.title}`,
          `<b>${after.title}</b> בוטל.`,
          RESEND_API_KEY.value()
        );
      } catch (err) {
        logger.error('Email send failed', err);
      }
    }
  }
);
