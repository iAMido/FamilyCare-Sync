export type Locale = 'en' | 'he';

export type TranslationKey =
  // Navigation / tabs
  | 'tab_home'
  | 'tab_history'
  | 'tab_family'
  // Dashboard
  | 'greeting_morning'
  | 'greeting_afternoon'
  | 'greeting_evening'
  | 'upcoming_count_one'
  | 'upcoming_count_other'
  | 'no_upcoming'
  | 'section_upcoming'
  | 'all_clear'
  | 'all_clear_sub'
  // Next treatment card
  | 'next_appointment'
  | 'im_going'
  | 'escort'
  | 'no_escort'
  | 'days_away'
  | 'today'
  | 'tomorrow'
  // History
  | 'history_title'
  | 'past_appointments'
  | 'filter_all'
  | 'filter_completed'
  | 'filter_cancelled'
  | 'no_history'
  | 'no_history_sub'
  // Family
  | 'family_title'
  | 'family_subtitle'
  | 'members'
  | 'authorized_emails'
  | 'authorized_emails_note'
  | 'settings'
  | 'appointment_types'
  | 'appointment_types_sub'
  | 'contacts_label'
  | 'contacts_sub'
  | 'language_label'
  | 'sign_out'
  | 'sign_out_confirm'
  | 'sign_out_confirm_msg'
  | 'cancel'
  // Quick Create
  | 'new_appointment'
  | 'edit_appointment'
  | 'appointment_type'
  | 'title_label'
  | 'date_label'
  | 'time_label'
  | 'location_label'
  | 'cycle_label'
  | 'protocol_steps'
  | 'protocol_info'
  | 'save'
  | 'save_with_steps'
  | 'discard_changes'
  // Treatment detail
  | 'detail_title'
  | 'status_scheduled'
  | 'status_completed'
  | 'status_cancelled'
  | 'mark_complete'
  | 'mark_cancelled'
  | 'edit'
  | 'delete'
  | 'delete_confirm'
  | 'delete_confirm_msg'
  | 'escort_label'
  | 'im_the_escort'
  | 'post_visit_summary'
  | 'add_summary'
  | 'side_effects'
  | 'add_side_effect'
  | 'no_side_effects'
  | 'severity_mild'
  | 'severity_moderate'
  | 'severity_severe'
  | 'cycle_badge'
  // Contacts
  | 'contacts_title'
  | 'contacts_empty'
  | 'contacts_empty_sub'
  | 'add_contact'
  | 'contact_name'
  | 'contact_role'
  | 'contact_phone'
  | 'contact_email'
  | 'contact_hospital'
  | 'contact_department'
  | 'contact_notes'
  | 'role_oncologist'
  | 'role_gp'
  | 'role_nurse'
  | 'role_pharmacist'
  | 'role_nutritionist'
  | 'role_psychologist'
  | 'role_coordinator'
  | 'role_other'
  | 'call'
  | 'send_email'
  // Presets
  | 'preset_title'
  | 'preset_empty'
  | 'preset_new'
  | 'preset_edit'
  | 'preset_name'
  | 'preset_icon'
  | 'preset_location'
  | 'preset_reminders'
  | 'preset_protocol'
  | 'add_reminder'
  | 'add_step'
  | 'before'
  | 'after'
  | 'days'
  | 'hours'
  // Common
  | 'save_changes'
  | 'loading'
  | 'error'
  | 'back'
  | 'done'
  | 'yes'
  | 'no'
  | 'required_field'
  | 'app_name'
  | 'app_tagline';

type Translations = Record<TranslationKey, string>;

export const EN: Translations = {
  tab_home: 'Home',
  tab_history: 'History',
  tab_family: 'Family',
  greeting_morning: 'Good morning',
  greeting_afternoon: 'Good afternoon',
  greeting_evening: 'Good evening',
  upcoming_count_one: '1 upcoming appointment',
  upcoming_count_other: '{{count}} upcoming appointments',
  no_upcoming: 'No upcoming appointments',
  section_upcoming: 'Upcoming',
  all_clear: 'All clear!',
  all_clear_sub: 'No upcoming appointments. Tap + to add one.',
  next_appointment: 'Next appointment',
  im_going: "I'm going",
  escort: 'Escort',
  no_escort: 'No escort yet',
  days_away: 'in {{n}} days',
  today: 'Today',
  tomorrow: 'Tomorrow',
  history_title: 'History',
  past_appointments: '{{count}} past appointments',
  filter_all: 'All',
  filter_completed: 'Completed',
  filter_cancelled: 'Cancelled',
  no_history: 'No history yet',
  no_history_sub: 'Completed and cancelled appointments will appear here.',
  family_title: 'Family',
  family_subtitle: 'Your care team',
  members: 'Members ({{count}})',
  authorized_emails: 'Authorized Emails',
  authorized_emails_note: 'Only these email addresses can sign in to FamilyCare Sync.',
  settings: 'Settings',
  appointment_types: 'Appointment Types',
  appointment_types_sub: 'Add, edit or configure protocols',
  contacts_label: 'Doctor Contacts',
  contacts_sub: 'Manage your medical team',
  language_label: 'Language / שפה',
  sign_out: 'Sign Out',
  sign_out_confirm: 'Sign Out',
  sign_out_confirm_msg: 'Are you sure you want to sign out?',
  cancel: 'Cancel',
  new_appointment: 'New Appointment',
  edit_appointment: 'Edit Appointment',
  appointment_type: 'Appointment Type',
  title_label: 'Title',
  date_label: 'Date',
  time_label: 'Time',
  location_label: 'Location',
  cycle_label: 'Cycle',
  protocol_steps: 'Protocol Steps',
  protocol_info: 'These linked appointments will be created automatically.',
  save: 'Save Appointment',
  save_with_steps: 'Save {{count}} Appointments 🔗',
  discard_changes: 'Discard changes?',
  detail_title: 'Appointment',
  status_scheduled: 'Scheduled',
  status_completed: 'Completed',
  status_cancelled: 'Cancelled',
  mark_complete: 'Mark Complete',
  mark_cancelled: 'Cancel Appointment',
  edit: 'Edit',
  delete: 'Delete',
  delete_confirm: 'Delete Appointment',
  delete_confirm_msg: 'This appointment will be permanently deleted.',
  escort_label: 'Escort',
  im_the_escort: "I'm the escort",
  post_visit_summary: 'Visit Summary',
  add_summary: 'Add Summary',
  side_effects: 'Side Effects',
  add_side_effect: '+ Add Side Effect',
  no_side_effects: 'No side effects logged.',
  severity_mild: 'Mild',
  severity_moderate: 'Moderate',
  severity_severe: 'Severe',
  cycle_badge: 'C{{n}}/{{total}}',
  contacts_title: 'Doctor Contacts',
  contacts_empty: 'No contacts yet',
  contacts_empty_sub: 'Add your doctors, nurses, and care coordinators here.',
  add_contact: 'Add Contact',
  contact_name: 'Name',
  contact_role: 'Role',
  contact_phone: 'Phone',
  contact_email: 'Email',
  contact_hospital: 'Hospital / Clinic',
  contact_department: 'Department',
  contact_notes: 'Notes',
  role_oncologist: 'Oncologist',
  role_gp: 'GP / Family Doctor',
  role_nurse: 'Nurse',
  role_pharmacist: 'Pharmacist',
  role_nutritionist: 'Nutritionist',
  role_psychologist: 'Psychologist',
  role_coordinator: 'Care Coordinator',
  role_other: 'Other',
  call: 'Call',
  send_email: 'Email',
  preset_title: 'Appointment Types',
  preset_empty: 'No appointment types yet',
  preset_new: 'New Type',
  preset_edit: 'Edit Type',
  preset_name: 'Name',
  preset_icon: 'Icon',
  preset_location: 'Default Location',
  preset_reminders: 'Reminders',
  preset_protocol: 'Protocol Steps',
  add_reminder: '+ Add Reminder',
  add_step: '+ Add Step',
  before: 'Before',
  after: 'After',
  days: 'days',
  hours: 'hours',
  save_changes: 'Save Changes',
  loading: 'Loading…',
  error: 'Something went wrong',
  back: 'Back',
  done: 'Done',
  yes: 'Yes',
  no: 'No',
  required_field: 'Required',
  app_name: 'FamilyCare Sync',
  app_tagline: 'Family medical care, coordinated.',
};

export const HE: Translations = {
  tab_home: 'בית',
  tab_history: 'היסטוריה',
  tab_family: 'משפחה',
  greeting_morning: 'בוקר טוב',
  greeting_afternoon: 'צהריים טובים',
  greeting_evening: 'ערב טוב',
  upcoming_count_one: 'תור אחד קרוב',
  upcoming_count_other: '{{count}} תורים קרובים',
  no_upcoming: 'אין תורים קרובים',
  section_upcoming: 'קרובים',
  all_clear: 'הכל נקי!',
  all_clear_sub: 'אין תורים קרובים. לחץ + להוסיף.',
  next_appointment: 'התור הבא',
  im_going: 'אני הולך/ת',
  escort: 'מלווה',
  no_escort: 'אין מלווה עדיין',
  days_away: 'בעוד {{n}} ימים',
  today: 'היום',
  tomorrow: 'מחר',
  history_title: 'היסטוריה',
  past_appointments: '{{count}} תורים קודמים',
  filter_all: 'הכל',
  filter_completed: 'הושלמו',
  filter_cancelled: 'בוטלו',
  no_history: 'אין היסטוריה עדיין',
  no_history_sub: 'תורים שהושלמו ובוטלו יופיעו כאן.',
  family_title: 'משפחה',
  family_subtitle: 'צוות הטיפול שלך',
  members: 'חברים ({{count}})',
  authorized_emails: 'כתובות מאושרות',
  authorized_emails_note: 'רק כתובות אלו יכולות להתחבר ל-FamilyCare Sync.',
  settings: 'הגדרות',
  appointment_types: 'סוגי תורים',
  appointment_types_sub: 'הוספה, עריכה וקביעת פרוטוקולים',
  contacts_label: 'אנשי קשר רפואיים',
  contacts_sub: 'ניהול הצוות הרפואי שלך',
  language_label: 'Language / שפה',
  sign_out: 'התנתק',
  sign_out_confirm: 'התנתקות',
  sign_out_confirm_msg: 'האם אתה בטוח שברצונך להתנתק?',
  cancel: 'ביטול',
  new_appointment: 'תור חדש',
  edit_appointment: 'עריכת תור',
  appointment_type: 'סוג תור',
  title_label: 'כותרת',
  date_label: 'תאריך',
  time_label: 'שעה',
  location_label: 'מיקום',
  cycle_label: 'מחזור',
  protocol_steps: 'שלבי פרוטוקול',
  protocol_info: 'תורים מקושרים אלו ייווצרו אוטומטית.',
  save: 'שמור תור',
  save_with_steps: 'שמור {{count}} תורים 🔗',
  discard_changes: 'לבטל שינויים?',
  detail_title: 'תור',
  status_scheduled: 'מתוכנן',
  status_completed: 'הושלם',
  status_cancelled: 'בוטל',
  mark_complete: 'סמן כהושלם',
  mark_cancelled: 'בטל תור',
  edit: 'עריכה',
  delete: 'מחיקה',
  delete_confirm: 'מחיקת תור',
  delete_confirm_msg: 'התור יימחק לצמיתות.',
  escort_label: 'מלווה',
  im_the_escort: 'אני המלווה',
  post_visit_summary: 'סיכום ביקור',
  add_summary: 'הוסף סיכום',
  side_effects: 'תופעות לוואי',
  add_side_effect: '+ הוסף תופעת לוואי',
  no_side_effects: 'לא נרשמו תופעות לוואי.',
  severity_mild: 'קלה',
  severity_moderate: 'בינונית',
  severity_severe: 'חמורה',
  cycle_badge: 'מ{{n}}/{{total}}',
  contacts_title: 'אנשי קשר רפואיים',
  contacts_empty: 'אין אנשי קשר עדיין',
  contacts_empty_sub: 'הוסף רופאים, אחיות ורכזי טיפול כאן.',
  add_contact: 'הוסף איש קשר',
  contact_name: 'שם',
  contact_role: 'תפקיד',
  contact_phone: 'טלפון',
  contact_email: 'אימייל',
  contact_hospital: 'בית חולים / קליניקה',
  contact_department: 'מחלקה',
  contact_notes: 'הערות',
  role_oncologist: 'אונקולוג',
  role_gp: 'רופא כללי',
  role_nurse: 'אחות',
  role_pharmacist: 'רוקח',
  role_nutritionist: 'תזונאי',
  role_psychologist: 'פסיכולוג',
  role_coordinator: 'רכז טיפול',
  role_other: 'אחר',
  call: 'התקשר',
  send_email: 'שלח מייל',
  preset_title: 'סוגי תורים',
  preset_empty: 'אין סוגי תורים עדיין',
  preset_new: 'סוג חדש',
  preset_edit: 'עריכת סוג',
  preset_name: 'שם',
  preset_icon: 'אייקון',
  preset_location: 'מיקום ברירת מחדל',
  preset_reminders: 'תזכורות',
  preset_protocol: 'שלבי פרוטוקול',
  add_reminder: '+ הוסף תזכורת',
  add_step: '+ הוסף שלב',
  before: 'לפני',
  after: 'אחרי',
  days: 'ימים',
  hours: 'שעות',
  save_changes: 'שמור שינויים',
  loading: 'טוען…',
  error: 'משהו השתבש',
  back: 'חזור',
  done: 'סיום',
  yes: 'כן',
  no: 'לא',
  required_field: 'שדה חובה',
  app_name: 'FamilyCare Sync',
  app_tagline: 'טיפול רפואי משפחתי, מתואם.',
};

/**
 * Interpolate variables into a translation string.
 * e.g. t('upcoming_count_other', { count: 3 }) → '3 upcoming appointments'
 */
export function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}
