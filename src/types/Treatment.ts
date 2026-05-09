export type TreatmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface TreatmentSummary {
  text: string;
  attachments: string[];   // Firebase Storage download URLs
  updatedAt?: Date;
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
}
