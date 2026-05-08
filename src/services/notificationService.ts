import { Platform } from 'react-native';
import { Treatment } from '../types/Treatment';
import { AutomatedReminder } from '../types/Preset';
import dayjs from 'dayjs';

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowList: true,
    }),
  });
}

export async function scheduleLocalReminder(
  treatment: Treatment,
  reminder: AutomatedReminder
): Promise<string> {
  if (Platform.OS === 'web') return '';

  const Notifications = require('expo-notifications');
  const triggerDate = dayjs(treatment.dateTime).add(reminder.offsetHours, 'hour').toDate();
  if (triggerDate <= new Date()) return '';

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'FamilyCare Sync',
      body: reminder.message,
      data: { treatmentId: treatment.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

export async function cancelLocalReminder(notificationId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const Notifications = require('expo-notifications');
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const Notifications = require('expo-notifications');
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
