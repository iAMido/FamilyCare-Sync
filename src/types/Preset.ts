export interface AutomatedReminder {
  offsetHours: number;
  message: string;
}

export interface Preset {
  id: string;
  name: string;
  defaultLocation: string;
  automatedReminders: AutomatedReminder[];
  color?: string;
  icon?: string;
}
