import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleOneShotReminder, cancelNotification } from "./notifications";
import { Habit } from "@/db/habit";

function getTodayKey(habitId: number): string {
  const today = new Date().toISOString().split("T")[0];
  return `habitReminder_${habitId}_${today}`;
}

export async function scheduleTodaysReminders(
  habit: Habit,
  isDoneToday: boolean,
): Promise<void> {
  if (isDoneToday) return;

  const scheduleDays: string[] = JSON.parse(habit.scheduleDays);
  const dayMap: Record<number, string> = {
    1: "sun",
    2: "mon",
    3: "tue",
    4: "wed",
    5: "thu",
    6: "fri",
    7: "sat",
  };
  const todayName = dayMap[new Date().getDay()];
  if (!scheduleDays.includes(todayName)) return;

  const key = getTodayKey(habit.id);
  const existing = await AsyncStorage.getItem(key);
  if (existing) return;

  const now = new Date();
  const morning = new Date(now);
  morning.setHours(9, 0, 0, 0);
  const evening = new Date(now);
  evening.setHours(20, 0, 0, 0);

  const ids: string[] = [];
  const morningId = await scheduleOneShotReminder(
    "Morning Check-in",
    `Don't forget: ${habit.title}`,
    morning,
  );

  const eveningId = await scheduleOneShotReminder(
    "Last call today",
    `You haven't logged "${habit.title}" yet`,
    evening,
  );

  if (morningId) ids.push(morningId);
  if (eveningId) ids.push(eveningId);

  await AsyncStorage.setItem(key, JSON.stringify(ids));
}

export async function cancelTodaysReminders(habitId: number): Promise<void> {
  const key = getTodayKey(habitId);
  const stored = await AsyncStorage.getItem(key);
  if (!stored) return;

  const ids: string[] = JSON.parse(stored);
  await Promise.all(ids.map((id) => cancelNotification(id)));
  await AsyncStorage.removeItem(key);
}
