export type UserRole = 'patient' | 'caregiver' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  fcmToken?: string;
  avatarColor?: string;
}
