import * as Notifications from 'expo-notifications';
import { Treatment } from '../types/Treatment';
import { AutomatedReminder } from '../types/Preset';
import dayjs from 'dayjs';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

export async function scheduleLocalReminder(
  treatment: Treatment,
  reminder: AutomatedReminder
): Promise<string> {
  const triggerDate = dayjs(treatment.dateTime).add(reminder.offsetHours, 'hour').toDate();

  if (triggerDate <= new Date()) return '';

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FamilyCare Sync',
      body: reminder.message,
      data: { treatmentId: treatment.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });

  return id;
}

export async function cancelLocalReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
