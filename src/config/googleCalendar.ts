export const GOOGLE_CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';

// Shared family calendar ID - set this to the Google Calendar ID
// of the shared calendar the service account writes to.
// Find it in Google Calendar Settings → Calendar → Calendar ID
export const FAMILY_CALENDAR_ID = process.env.EXPO_PUBLIC_FAMILY_CALENDAR_ID ?? '';

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];
