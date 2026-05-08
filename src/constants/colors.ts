export const Colors = {
  // Brand — sage green
  primary: '#6B9E7A',
  primaryLight: '#8DB89A',
  primaryDark: '#4E7E5C',
  primaryBg: '#EEF5F0',

  // Accent
  accent: '#E8734A',
  accentBg: '#FDF0EB',

  // Semantic
  success: '#6B9E7A',
  warning: '#F5A623',
  warningBg: '#FEF6E4',
  error: '#E05C5C',
  errorBg: '#FDEAEA',
  cancelled: '#A0A8B4',

  // Backgrounds
  background: '#F6F4EF',
  surface: '#FFFFFF',
  surfaceVariant: '#F0EDE8',
  border: '#E8E4DD',

  // Text
  textPrimary: '#2C2C2C',
  textSecondary: '#5E6472',
  textMuted: '#A0A8B4',
  textOnPrimary: '#FFFFFF',

  // Timeline dot colors (appointment types)
  dot1: '#6B9E7A',  // sage
  dot2: '#7B9ED9',  // sky blue
  dot3: '#C97BBD',  // soft purple
  dot4: '#E8734A',  // warm orange
  dot5: '#5BB5C3',  // teal

  // Status
  statusScheduled: '#7B9ED9',
  statusCompleted: '#6B9E7A',
  statusCancelled: '#A0A8B4',
} as const;

export const StatusColors: Record<string, string> = {
  scheduled: Colors.statusScheduled,
  completed: Colors.statusCompleted,
  cancelled: Colors.statusCancelled,
};

// Dot colors cycle for timeline items
export const DotColors = [
  Colors.dot1,
  Colors.dot2,
  Colors.dot3,
  Colors.dot4,
  Colors.dot5,
];
