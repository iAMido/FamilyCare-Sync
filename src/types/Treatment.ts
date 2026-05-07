export type TreatmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface TreatmentSummary {
  text: string;
  attachments: string[];
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
}
