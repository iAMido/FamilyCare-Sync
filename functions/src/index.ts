import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  GOOGLE_SA_KEY,
  TreatmentData,
} from './helpers/calendarHelper';

initializeApp();

export { onTreatmentCreate } from './onTreatmentCreate';
export { onTreatmentUpdate } from './onTreatmentUpdate';
export { scheduledReminders } from './scheduledReminders';

/**
 * Callable: manually trigger calendar sync for a treatment.
 * Called from the client after creating/updating a treatment
 * if the Firestore trigger didn't fire or for retry.
 */
export const syncCalendarEvent = onCall(
  { secrets: [GOOGLE_SA_KEY] },
  async (request) => {
    const { treatmentId } = request.data as { treatmentId: string };
    if (!treatmentId) throw new HttpsError('invalid-argument', 'treatmentId required');

    const db = getFirestore();
    const ref = db.collection('treatments').doc(treatmentId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError('not-found', 'Treatment not found');

    const data = snap.data()!;

    // If already has a calendar event, update it instead
    if (data.calendarEventId) {
      try {
        await updateCalendarEvent(
          data.calendarEventId,
          {
            title: data.title,
            location: data.location,
            dateTime: (data.dateTime as Timestamp).toDate(),
          },
          GOOGLE_SA_KEY.value()
        );
        logger.info(`Calendar event updated for treatment ${treatmentId}`);
        return { success: true, action: 'updated', calendarEventId: data.calendarEventId };
      } catch (err) {
        logger.error('Calendar update failed, will recreate', err);
      }
    }

    // Create new calendar event
    const treatment: TreatmentData = {
      id: treatmentId,
      title: data.title,
      location: data.location,
      dateTime: data.dateTime as Timestamp,
      escortId: data.escortId ?? null,
    };

    const calendarEventId = await createCalendarEvent(treatment, GOOGLE_SA_KEY.value());
    await ref.update({ calendarEventId });
    logger.info(`Calendar event created for treatment ${treatmentId}: ${calendarEventId}`);
    return { success: true, action: 'created', calendarEventId };
  }
);

/**
 * Callable: delete a calendar event for a treatment.
 * Sets status to 'cancelled' and removes the Google Calendar event.
 */
export const cancelCalendarEvent = onCall(
  { secrets: [GOOGLE_SA_KEY] },
  async (request) => {
    const { treatmentId } = request.data as { treatmentId: string };
    if (!treatmentId) throw new HttpsError('invalid-argument', 'treatmentId required');

    const db = getFirestore();
    const ref = db.collection('treatments').doc(treatmentId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError('not-found', 'Treatment not found');

    const data = snap.data()!;
    const calendarEventId = data.calendarEventId as string | null;

    if (calendarEventId) {
      try {
        await deleteCalendarEvent(calendarEventId, GOOGLE_SA_KEY.value());
        logger.info(`Calendar event deleted for treatment ${treatmentId}: ${calendarEventId}`);
      } catch (err) {
        logger.error('Calendar delete failed', err);
        // Continue anyway — still mark as cancelled in Firestore
      }
    }

    // Update status to cancelled and clear the calendar event ID
    await ref.update({ status: 'cancelled', calendarEventId: null });
    return { success: true };
  }
);
