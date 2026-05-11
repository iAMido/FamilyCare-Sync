export type ContactRole =
  | 'oncologist'
  | 'gp'
  | 'nurse'
  | 'pharmacist'
  | 'nutritionist'
  | 'psychologist'
  | 'coordinator'
  | 'other';

export interface Contact {
  id: string;
  name: string;
  role: ContactRole;
  phone?: string | null;
  email?: string | null;
  hospital?: string | null;
  department?: string | null;
  notes?: string | null;
  createdAt?: Date;
}
