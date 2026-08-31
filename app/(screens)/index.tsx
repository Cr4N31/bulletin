import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import FloatingActionButton from "@/components/FloatingActionButton";
import StreakGraph from "@/components/StreakGraph";
import { useUser } from "@/context/UserContext";
import {
  getHabits,
  getPriorityHabit,
  getHabitLogs,
  Habit,
  HabitLog,
} from "@/db/habit";
import { getProjects, Project } from "@/db/project";
import { getMeetings, Meeting } from "@/db/meeting";
import { parseMeetingDateTime } from "@/utils/meetingTime";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export default function Index() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { userName } = useUser();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [priorityHabit, setPriorityHabit] = useState<Habit | null>(null);
  const [priorityLogs, setPriorityLogs] = useState<HabitLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHabits().then(setHabits);
      getProjects().then(setProjects);
      getMeetings().then(setMeetings);

      getPriorityHabit().then((habit) => {
        setPriorityHabit(habit);
        if (habit) {
          getHabitLogs(habit.id, 30).then(setPriorityLogs);
        } else {
          setPriorityLogs([]);
        }
      });
    }, []),
  );

  const today = getTodayString();
  const activeProjects = projects.filter((p) => p.status !== "Completed");
  const upcomingMeetings = meetings.filter(
    (m) => parseMeetingDateTime(m).getTime() > Date.now(),
  );

  const surface = isDark ? "#252525" : "white";
  const border = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-white dark:bg-[#191919]"
    >
      <View className="flex-1 px-6">
        <View className="py-8">
          <Text className="font-bold text-3xl text-black dark:text-white">
            {userName ? `Welcome back, ${userName}` : "Welcome back"}
          </Text>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-3 mt-6">
          <View
            className="flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Text className="text-2xl font-bold text-black dark:text-white">
              {activeProjects.length}
            </Text>
            <Text className="text-xs text-black/40 dark:text-white/40 mt-1">
              Active projects
            </Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Text className="text-2xl font-bold text-black dark:text-white">
              {upcomingMeetings.length}
            </Text>
            <Text className="text-xs text-black/40 dark:text-white/40 mt-1">
              Upcoming meetings
            </Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Text className="text-2xl font-bold text-black dark:text-white">
              {habits.length}
            </Text>
            <Text className="text-xs text-black/40 dark:text-white/40 mt-1">
              Habits tracked
            </Text>
          </View>
        </View>

        {/* Priority habit streak graph */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-black dark:text-white mb-3">
            Priority habit
          </Text>
          {priorityHabit ? (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(screens)/HabitDetail?id=${priorityHabit.id}` as any,
                )
              }
              activeOpacity={0.8}
              className="rounded-2xl p-5"
              style={{
                backgroundColor: surface,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Ionicons
                  name="star"
                  size={16}
                  color={isDark ? "#fff" : "#000"}
                />
                <Text className="font-semibold text-black dark:text-white">
                  {priorityHabit.title}
                </Text>
              </View>
              <StreakGraph logs={priorityLogs} />
            </TouchableOpacity>
          ) : (
            <View
              className="rounded-2xl p-5 items-center"
              style={{
                backgroundColor: surface,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <Text className="text-black/40 dark:text-white/40 text-sm">
                No habit marked as priority
              </Text>
            </View>
          )}
        </View>

        {/* Condensed goals summary (Project progress) */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-black dark:text-white mb-3">
            Goals
          </Text>
          {activeProjects.length === 0 ? (
            <View
              className="rounded-2xl p-5 items-center"
              style={{
                backgroundColor: surface,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <Text className="text-black/40 dark:text-white/40 text-sm">
                No active projects yet
              </Text>
            </View>
          ) : (
            activeProjects.slice(0, 3).map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() =>
                  router.push(
                    `/(screens)/ProjectDetail?id=${project.id}` as any,
                  )
                }
                activeOpacity={0.8}
                className="rounded-2xl p-4 mb-2"
                style={{
                  backgroundColor: surface,
                  borderWidth: 1,
                  borderColor: border,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="font-medium text-black dark:text-white flex-1"
                    numberOfLines={1}
                  >
                    {project.title}
                  </Text>
                  <Text className="text-xs text-black/40 dark:text-white/40 ml-2">
                    {project.progress}%
                  </Text>
                </View>
                <View className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <View
                    className="h-1.5 bg-black dark:bg-white rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
