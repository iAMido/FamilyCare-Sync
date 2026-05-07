import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { onTreatmentCreate } from './onTreatmentCreate';
export { onTreatmentUpdate } from './onTreatmentUpdate';
export { scheduledReminders } from './scheduledReminders';
