import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { LineChart } from "react-native-gifted-charts";
import {
  getHabit,
  getHabitLogs,
  toggleHabitLog,
  Habit,
  HabitLog,
} from "@/db/habit";
import StreakGraph from "@/components/StreakGraph";
import { logActivity } from "@/db/activityLog";
import {
  scheduleTodaysReminders,
  cancelTodaysReminders,
} from "@/utils/habitReminders";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getCurrentStreak(logs: HabitLog[]): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  );
  const today = getTodayString();

  const cursor = new Date();
  if (!completedDates.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (completedDates.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getStreakHistory(logs: HabitLog[], daysBack: number = 30) {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  );
  const history: { date: string; streakValue: number }[] = [];
  let running = 0;

  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    if (completedDates.has(dateStr)) {
      running++;
    } else {
      running = 0;
    }
    history.push({ date: dateStr, streakValue: running });
  }

  return history;
}

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  const habitId = Number(id);
  const today = getTodayString();
  const isDoneToday = logs.some((l) => l.date === today && l.completed);

  useFocusEffect(
    useCallback(() => {
      if (!habitId) return;
      getHabit(habitId).then(setHabit);
      getHabitLogs(habitId, 30).then(setLogs);
    }, [habitId]),
  );

  useFocusEffect(
    useCallback(() => {
      if (habit) {
        scheduleTodaysReminders(habit, isDoneToday);
      }
    }, [habit, isDoneToday]),
  );

  async function handleMarkDone() {
    if (!habit || isDoneToday) return;

    await toggleHabitLog(habitId, today);
    await logActivity("habit", "completed", `Completed "${habit.title}"`);
    await cancelTodaysReminders(habitId);

    const updated = await getHabitLogs(habitId, 30);
    setLogs(updated);
  }

  if (!habit) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F8F8] dark:bg-[#191919] items-center justify-center">
        <Text className="text-black/30 dark:text-white/30">Loading...</Text>
      </SafeAreaView>
    );
  }

  const streak = getCurrentStreak(logs);
  const streakHistory = getStreakHistory(logs, 30);
  const chartData = streakHistory.map((h) => ({ value: h.streakValue }));

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      className="flex-1 bg-[#F8F8F8] dark:bg-[#191919]"
    >
      <View className="px-6 py-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text className="text-2xl font-bold flex-1 text-black dark:text-white">
          {habit.title}
        </Text>
        {habit.isPriority && (
          <Ionicons name="star" size={20} color={isDark ? "#ada9a3" : "#000"} />
        )}
      </View>

      <View className="px-6 mt-2">
        <View className="bg-black dark:bg-[#252525] rounded-[28px] p-6">
          <Text className="text-white/60 text-sm">Current streak</Text>
          <Text className="text-white text-4xl font-bold mt-1">
            {streak} {streak === 1 ? "day" : "days"}
          </Text>
        </View>
      </View>

      <View className="px-6 mt-8">
        <Text className="text-lg font-bold mb-4 text-black dark:text-white">
          Streak history
        </Text>
        <View className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/5 rounded-2xl p-4">
          <LineChart
            data={chartData}
            color={isDark ? "#ffffff" : "#000000"}
            thickness={2}
            dataPointsColor={isDark ? "#ffffff" : "#000000"}
            hideRules
            hideDataPoints
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{
              color: isDark ? "#ffffff40" : "#00000040",
              fontSize: 10,
            }}
            curved
            height={100}
            noOfSections={3}
            initialSpacing={5}
            spacing={10}
          />
        </View>
        <Text className="text-xs text-black/40 dark:text-white/40 mt-2">
          Rises with each consecutive day completed — drops to zero when a
          scheduled day is missed.
        </Text>
      </View>

      <View className="px-6 mt-8">
        <Text className="text-lg font-bold mb-4 text-black dark:text-white">
          Last 30 days
        </Text>
        <StreakGraph logs={logs} />
      </View>

      <TouchableOpacity
        onPress={handleMarkDone}
        disabled={isDoneToday}
        activeOpacity={isDoneToday ? 1 : 0.85}
        className={`mx-6 mt-10 h-14 rounded-2xl items-center justify-center flex-row gap-2 ${
          isDoneToday
            ? "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10"
            : "bg-black"
        }`}
      >
        <Ionicons
          name={isDoneToday ? "checkmark-circle" : "checkmark-circle-outline"}
          size={20}
          color={isDoneToday ? (isDark ? "#fff" : "#000") : "#fff"}
        />
        <Text
          className={`font-semibold text-base ${
            isDoneToday ? "text-black dark:text-white" : "text-white"
          }`}
        >
          {isDoneToday ? "Done today" : "Mark today as done"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
