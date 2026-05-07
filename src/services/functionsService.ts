import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export async function triggerCalendarSync(treatmentId: string): Promise<void> {
  const fn = httpsCallable(functions, 'syncCalendarEvent');
  await fn({ treatmentId });
}

export async function cancelCalendarEvent(treatmentId: string): Promise<void> {
  const fn = httpsCallable(functions, 'cancelCalendarEvent');
  await fn({ treatmentId });
}
