import * as functions from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { deleteCalendarEvent, GOOGLE_SA_KEY } from './helpers/calendarHelper';

export const onTreatmentDelete = functions.onDocumentDeleted(
  { document: 'treatments/{treatmentId}', secrets: [GOOGLE_SA_KEY] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const calendarEventId = data.calendarEventId as string | null;
    if (!calendarEventId) return;

    try {
      await deleteCalendarEvent(calendarEventId, GOOGLE_SA_KEY.value());
      logger.info('Calendar event deleted for treatment', event.params.treatmentId);
    } catch (err) {
      logger.error('Calendar delete on treatment delete failed', err);
    }
  }
);
