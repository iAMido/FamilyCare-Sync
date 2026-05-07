export const Colors = {
  primary: '#2E7D9B',
  primaryLight: '#4AAECF',
  primaryDark: '#1A5F7A',
  accent: '#E8734A',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  cancelled: '#9E9E9E',

  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF2F7',
  border: '#E0E6ED',

  textPrimary: '#1A2332',
  textSecondary: '#5A6A7A',
  textMuted: '#9AA5B0',
  textOnPrimary: '#FFFFFF',

  statusScheduled: '#2196F3',
  statusCompleted: '#4CAF50',
  statusCancelled: '#9E9E9E',
} as const;

export const StatusColors: Record<string, string> = {
  scheduled: Colors.statusScheduled,
  completed: Colors.statusCompleted,
  cancelled: Colors.statusCancelled,
};
