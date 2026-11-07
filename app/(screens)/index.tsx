import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
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
import { LineChart } from "react-native-gifted-charts";
import { getActivityCountByDay } from "@/db/activityLog";
import { translate } from "@/utils/localization";

function getTodayString(): string {
  return getDateKey(new Date());
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Index() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { userName, language } = useUser();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const [weeklyActivity, setWeeklyActivity] = useState<
    { date: string; count: number }[]
  >([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [priorityHabit, setPriorityHabit] = useState<Habit | null>(null);
  const [priorityLogs, setPriorityLogs] = useState<HabitLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useFocusEffect(
    useCallback(() => {
      setCurrentTime(Date.now());
      getHabits().then(setHabits);
      getProjects().then(setProjects);
      getMeetings().then(setMeetings);
      getActivityCountByDay(7).then(setWeeklyActivity);
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

  const activeProjects = projects.filter((p) => p.status !== "Completed");
  const upcomingMeetings =
    currentTime === null
      ? []
      : meetings.filter(
          (m) => parseMeetingDateTime(m).getTime() > currentTime,
        );

  const surface = isDark ? "#252525" : "white";
  const border = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const chartData = weeklyActivity.map((d) => ({
    value: d.count,
    label: new Date(d.date)
      .toLocaleDateString(language, { weekday: "short" })
      .slice(0, 2),
  }));
  const monthLabel = visibleMonth.toLocaleDateString(language, {
    month: "long",
    year: "numeric",
  });
  const weekStartsMonday = language !== "en";
  const firstDayOfMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  ).getDay();
  const calendarOffset = (firstDayOfMonth - (weekStartsMonday ? 1 : 0) + 7) % 7;
  const calendarDays = Array.from({ length: 42 }, (_, dayIndex) => {
    const date = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      dayIndex - calendarOffset + 1,
    );
    return { date, key: getDateKey(date) };
  });
  const weekDays = Array.from({ length: 7 }, (_, dayIndex) =>
    new Date(2024, 0, dayIndex + (weekStartsMonday ? 8 : 7)).toLocaleDateString(language, {
      weekday: "short",
    }),
  );
  const selectedMeetings = meetings.filter(
    (meeting) => meeting.date === selectedDate,
  );
  const selectedDateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    language,
    { weekday: "long", month: "long", day: "numeric" },
  );

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-white dark:bg-[#191919]"
    >
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="py-8">
          <Text className="font-bold text-3xl text-black dark:text-white">
            {userName ? `${t("welcomeBack")}, ${userName}` : t("welcomeBack")}
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
              {t("activeProjects")}
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
              {t("upcomingMeetings")}
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
              {t("habitsTracked")}
            </Text>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-lg font-bold text-black dark:text-white mb-3">
            {t("calendar")}
          </Text>
          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                accessibilityLabel={t("previousMonth")}
                className="w-9 h-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
              <Text className="text-base font-semibold text-black dark:text-white capitalize">
                {monthLabel}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setVisibleMonth(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                accessibilityLabel={t("nextMonth")}
                className="w-9 h-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row mb-2">
              {weekDays.map((day, dayIndex) => (
                <Text
                  key={dayIndex}
                  className="flex-1 text-center text-xs text-black/40 dark:text-white/40"
                >
                  {day}
                </Text>
              ))}
            </View>
            <View className="flex-row flex-wrap">
              {calendarDays.map(({ date, key }) => {
                const inMonth = date.getMonth() === visibleMonth.getMonth();
                const selected = key === selectedDate;
                const hasMeetings = meetings.some(
                  (meeting) => meeting.date === key,
                );
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedDate(key)}
                    accessibilityRole="button"
                    accessibilityLabel={date.toLocaleDateString(language, {
                      dateStyle: "full",
                    })}
                    accessibilityState={{ selected }}
                    className="w-[14.2857%] h-10 items-center justify-center"
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        selected ? "bg-black dark:bg-white" : ""
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selected
                            ? "text-white dark:text-black font-semibold"
                            : inMonth
                              ? "text-black dark:text-white"
                              : "text-black/25 dark:text-white/25"
                        }`}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                    {hasMeetings && (
                      <View
                        className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                          selected
                            ? "bg-white dark:bg-black"
                            : "bg-blue-500"
                        }`}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="h-px bg-black/5 dark:bg-white/10 my-3" />
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-semibold text-black dark:text-white capitalize">
                {selectedDateLabel}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/(screens)/addScreens/addMeetings?date=${selectedDate}` as any,
                  )
                }
                accessibilityRole="button"
                className="flex-row items-center gap-1"
              >
                <Ionicons
                  name="add-circle"
                  size={20}
                  color={isDark ? "#fff" : "#000"}
                />
                <Text className="text-xs font-medium text-black dark:text-white">
                  {t("scheduleMeeting")}
                </Text>
              </TouchableOpacity>
            </View>
            {selectedMeetings.length === 0 ? (
              <Text className="text-sm text-black/40 dark:text-white/40 py-2">
                {t("noMeetingsOnDate")}
              </Text>
            ) : (
              selectedMeetings.map((meeting) => (
                <TouchableOpacity
                  key={meeting.id}
                  onPress={() =>
                    router.push(
                      `/(screens)/MeetingDetail?id=${meeting.id}` as any,
                    )
                  }
                  className="flex-row items-center rounded-xl bg-black/5 dark:bg-white/5 px-3 py-3 mb-2"
                >
                  <View className="w-1 h-9 rounded-full bg-blue-500 mr-3" />
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-medium text-black dark:text-white"
                    >
                      {meeting.title}
                    </Text>
                    <Text className="text-xs text-black/40 dark:text-white/40 mt-1">
                      {meeting.time}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={isDark ? "#ffffff80" : "#00000060"}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-lg font-bold text-black dark:text-white mb-3">
            {t("thisWeek")}
          </Text>
          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <LineChart
              data={chartData}
              color={isDark ? "#ffffff" : "#000000"}
              thickness={2}
              dataPointsColor={isDark ? "#ffffff" : "#000000"}
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{
                color: isDark ? "#ffffff40" : "#00000040",
                fontSize: 10,
              }}
              xAxisLabelTextStyle={{
                color: isDark ? "#ffffff40" : "#00000040",
                fontSize: 10,
              }}
              curved
              height={120}
              noOfSections={3}
              initialSpacing={10}
              spacing={40}
            />
          </View>
        </View>

        {/* Priority habit streak graph */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-black dark:text-white mb-3">
            {t("priorityHabit")}
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
                {t("noPriorityHabit")}
              </Text>
            </View>
          )}
        </View>

        {/* Condensed goals summary (Project progress) */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-black dark:text-white mb-3">
            {t("goals")}
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
                {t("noActiveProjects")}
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
      </ScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
