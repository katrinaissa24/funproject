import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Gentle daily nudges via local notifications.
 * Note: Expo Go on Android (SDK 53+) doesn't support notifications —
 * we degrade silently there; everything works on iOS Expo Go and in real builds.
 */

export function notificationsSupported(): boolean {
  const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  return !(Platform.OS === 'android' && inExpoGo);
}

export async function requestPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function scheduleDailyNudges(opts: { morningHour: number; eveningHour: number }): Promise<void> {
  if (!notificationsSupported()) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('nudges', {
        name: 'Daily nudges',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your day is ready',
        body: 'Three things matter today. Come see which ones.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: opts.morningHour,
        minute: 30,
      },
    });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Two-minute review?',
        body: 'Close the day: check habits, clear the inbox, pick tomorrow’s top task.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: opts.eveningHour,
        minute: 0,
      },
    });
  } catch {
    // never let nudges crash the app
  }
}

export async function cancelAllNudges(): Promise<void> {
  if (!notificationsSupported()) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
