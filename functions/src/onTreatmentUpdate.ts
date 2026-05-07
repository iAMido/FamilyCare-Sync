import * as functions from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { Timestamp } from 'firebase-admin/firestore';
import { updateCalendarEvent, deleteCalendarEvent, GOOGLE_SA_KEY } from './helpers/calendarHelper';
import { notifyAllFamily, notifyUsers } from './helpers/fcmHelper';
import dayjs from 'dayjs';

export const onTreatmentUpdate = functions.onDocumentUpdated(
  { document: 'treatments/{treatmentId}', secrets: [GOOGLE_SA_KEY] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const calendarEventId = after.calendarEventId as string | null;
    const saKey = GOOGLE_SA_KEY.value();

    // Appointment rescheduled — update calendar and notify
    const dateChanged =
      (before.dateTime as Timestamp).seconds !== (after.dateTime as Timestamp).seconds;
    const locationChanged = before.location !== after.location;
    const titleChanged = before.title !== after.title;

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
        await notifyAllFamily(
          '🔄 Appointment rescheduled',
          `${after.title} moved to ${dt.format('D MMM')} at ${dt.format('HH:mm')}`,
          { treatmentId: event.params.treatmentId, screen: 'TreatmentDetail' }
        );
      }
    }

    // Escort assigned/changed
    if (before.escortId !== after.escortId && after.escortId) {
      await notifyUsers(
        [after.escortId],
        '✋ You are assigned as escort',
        `You are going to: ${after.title}`,
        { treatmentId: event.params.treatmentId, screen: 'TreatmentDetail' }
      );
    }

    // Appointment cancelled — delete calendar event
    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      if (calendarEventId) {
        try {
          await deleteCalendarEvent(calendarEventId, saKey);
        } catch (err) {
          logger.error('Calendar delete failed', err);
        }
      }
      await notifyAllFamily(
        '❌ Appointment cancelled',
        `${after.title} has been cancelled`,
        { treatmentId: event.params.treatmentId }
      );
    }
  }
);
