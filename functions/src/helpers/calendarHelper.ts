import { google } from 'googleapis';
import { defineSecret } from 'firebase-functions/params';
import { Timestamp } from 'firebase-admin/firestore';

export const GOOGLE_SA_KEY = defineSecret('GOOGLE_SA_KEY');

const FAMILY_CALENDAR_ID = process.env.FAMILY_CALENDAR_ID ?? 'primary';

function getCalendar(serviceAccountKeyJson: string) {
  const credentials = JSON.parse(serviceAccountKeyJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

export interface TreatmentData {
  id: string;
  title: string;
  location: string;
  dateTime: Timestamp;
  escortId: string | null;
}

export async function createCalendarEvent(
  treatment: TreatmentData,
  serviceAccountKeyJson: string
): Promise<string> {
  const calendar = getCalendar(serviceAccountKeyJson);
  const start = treatment.dateTime.toDate();
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const event = await calendar.events.insert({
    calendarId: FAMILY_CALENDAR_ID,
    requestBody: {
      summary: treatment.title,
      location: treatment.location,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      description: `FamilyCare Sync appointment ID: ${treatment.id}`,
      colorId: '11',
    },
  });

  return event.data.id ?? '';
}

export async function updateCalendarEvent(
  eventId: string,
  patch: Partial<{ title: string; location: string; dateTime: Date }>,
  serviceAccountKeyJson: string
): Promise<void> {
  const calendar = getCalendar(serviceAccountKeyJson);
  const requestBody: Record<string, unknown> = {};

  if (patch.title) requestBody.summary = patch.title;
  if (patch.location) requestBody.location = patch.location;
  if (patch.dateTime) {
    const end = new Date(patch.dateTime.getTime() + 2 * 60 * 60 * 1000);
    requestBody.start = { dateTime: patch.dateTime.toISOString() };
    requestBody.end = { dateTime: end.toISOString() };
  }

  await calendar.events.patch({
    calendarId: FAMILY_CALENDAR_ID,
    eventId,
    requestBody,
  });
}

export async function deleteCalendarEvent(
  eventId: string,
  serviceAccountKeyJson: string
): Promise<void> {
  const calendar = getCalendar(serviceAccountKeyJson);
  await calendar.events.delete({ calendarId: FAMILY_CALENDAR_ID, eventId });
}
