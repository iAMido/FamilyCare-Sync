export interface AutomatedReminder {
  offsetHours: number;
  message: string;
}

/** One auto-created linked appointment relative to the main one */
export interface ProtocolStep {
  presetId: string;    // which preset to instantiate
  offsetDays: number;  // negative = before, positive = after main date
  label?: string;      // optional title override
}

export interface Preset {
  id: string;
  name: string;
  defaultLocation: string;
  automatedReminders: AutomatedReminder[];
  color?: string;
  icon?: string;
  /** If set, scheduling this preset will offer to auto-create linked appointments */
  protocol?: {
    steps: ProtocolStep[];
  };
  /** If set, the patient is going through N cycles (e.g. 6 chemo cycles) */
  totalCycles?: number | null;
}
