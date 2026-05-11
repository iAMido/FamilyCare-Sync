export type TreatmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface TreatmentSummary {
  text: string;
  attachments: string[];   // Firebase Storage download URLs
  updatedAt?: Date;
}

/** A reminder saved on the treatment (copied from the preset at creation time) */
export interface TreatmentReminder {
  offsetHours: number;   // negative = before the appointment
  message: string;
}

export interface Treatment {
  id: string;
  presetId: string;
  title: string;
  location: string;
  dateTime: Date;
  escortId: string | null;
  status: TreatmentStatus;
  summary: TreatmentSummary | null;
  calendarEventId: string | null;
  createdAt?: Date;
  createdBy?: string;
  /** Shared across all appointments created together from a protocol */
  protocolGroupId?: string | null;
  /** Whether this is the anchor appointment or a generated step */
  protocolRole?: 'main' | 'step';
  /** cycle number if part of a cycle plan (e.g. 3 of 6) */
  cycleNumber?: number | null;
  /** total number of cycles in the plan (copied from preset at creation time) */
  cycleTotal?: number | null;
  /** side effects logged after the appointment */
  sideEffects?: SideEffect[];
  /** reminders attached to this appointment (copied from preset at creation time) */
  reminders?: TreatmentReminder[];
}

export type SideEffectSeverity = 'mild' | 'moderate' | 'severe';

export interface SideEffect {
  id: string;
  description: string;
  severity: SideEffectSeverity;
  loggedAt: Date;
}
