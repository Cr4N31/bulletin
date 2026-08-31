import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return finalStatus === "granted";
}

export async function scheduleMeetingReminder(
  meetingId: number,
  title: string,
  triggerDate: Date,
): Promise<string | null> {
  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming meeting",
      body: title,
      data: { type: "meeting", id: meetingId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function scheduleHabitReminder(
  habitId: number,
  title: string,
  hour: number = 9,
  minute: number = 0,
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit reminder",
      body: `Don't forget: ${title}`,
      data: { type: "habit", id: habitId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

const DAY_TO_WEEKDAY: Record<string, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

export async function scheduleHabitReminders(
  habitId: number,
  title: string,
  scheduleDays: string[],
  morningHour: number = 9,
  eveningHour: number = 20,
): Promise<string[]> {
  const ids: string[] = [];

  for (const day of scheduleDays) {
    const weekday = DAY_TO_WEEKDAY[day];
    if (!weekday) continue;

    const morningId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Morning check-in",
        body: `Time to work on: ${title}`,
        data: { type: "habit", id: habitId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: morningHour,
        minute: 0,
      },
    });

    const eveningId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't forget",
        body: `Log your progress on: ${title}`,
        data: { type: "habit", id: habitId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: eveningHour,
        minute: 0,
      },
    });

    ids.push(morningId, eveningId);
  }

  return ids;
}
