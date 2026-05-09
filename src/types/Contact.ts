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
  phone?: string;
  email?: string;
  hospital?: string;
  department?: string;
  notes?: string;
  createdAt?: Date;
}
