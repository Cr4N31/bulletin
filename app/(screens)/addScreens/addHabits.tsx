import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createHabit as createHabitInDb } from "@/db/habit";
import {
  requestNotificationPermission,
  scheduleHabitReminders,
} from "@/utils/notifications";
import { useColorScheme } from "nativewind";

const DAYS = [
  { label: "M", value: "mon" },
  { label: "T", value: "tue" },
  { label: "W", value: "wed" },
  { label: "T", value: "thu" },
  { label: "F", value: "fri" },
  { label: "S", value: "sat" },
  { label: "S", value: "sun" },
];

export default function AddHabit() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<string[]>([
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
  ]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (day: string) => {
    setScheduleDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  };

  const selectEveryDay = () => setScheduleDays(DAYS.map((day) => day.value));
  const selectWeekdays = () =>
    setScheduleDays(["mon", "tue", "wed", "thu", "fri"]);
  const selectWeekends = () => setScheduleDays(["sat", "sun"]);

  const handleCreateHabit = async () => {
    if (!title.trim()) {
      Alert.alert("Habit name required", "Give your habit a name first.");
      return;
    }

    if (scheduleDays.length === 0) {
      Alert.alert(
        "Choose a schedule",
        "Select at least one day for this habit.",
      );
      return;
    }

    try {
      setIsSaving(true);

      const habitId = await createHabitInDb(
        title.trim(),
        isPriority,
        JSON.stringify(scheduleDays),
      );

      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleHabitReminders(habitId, title.trim(), scheduleDays);
      }

      router.back();
    } catch (error) {
      console.error("Failed to create habit:", error);
      Alert.alert(
        "Something went wrong",
        "We couldn't create this habit. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      className="flex-1 dark:bg-[#191919] bg-[#F8F8F8]"
    >
      {/* Header */}
      <View className="px-6 py-5 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>

        <Text className="text-lg dark:text-white font-semibold">New Habit</Text>

        <TouchableOpacity
          onPress={handleCreateHabit}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text
            className={`font-semibold ${isSaving ? "text-gray-400" : "text-black dark:text-white"}`}
          >
            {isSaving ? "Saving..." : "Done"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View className="px-6 pt-8">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
            Habit
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What do you want to do?"
            placeholderTextColor="#A3A3A3"
            autoFocus
            className="text-4xl font-bold mt-2 text-black dark:text-white"
            selectionColor={isDark ? "white" : "black"}
          />

          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
            Make it something simple enough to repeat.
          </Text>
        </View>

        {/* Preview Card */}
        <View className="px-6 mt-8">
          <View className="bg-black dark:bg-[#252525] rounded-[28px] p-6">
            <View className="flex-row items-center justify-between">
              <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={25}
                  color="white"
                />
              </View>

              <TouchableOpacity
                onPress={() => setIsPriority(!isPriority)}
                activeOpacity={0.8}
                className={`flex-row items-center rounded-full px-3 py-2 ${
                  isPriority ? "bg-white/60" : "bg-white/10"
                }`}
              >
                <Ionicons
                  name="star"
                  size={14}
                  color={isPriority ? "black" : "white"}
                />
                <Text
                  className={`ml-2 text-xs font-semibold ${isPriority ? "text-black" : "text-white"}`}
                >
                  Priority
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-white text-2xl font-bold mt-6">
              {title.trim() || "Your new habit"}
            </Text>

            <Text className="text-white/50 mt-2">
              {scheduleDays.length === 7
                ? "Every day"
                : scheduleDays.length === 5 &&
                    scheduleDays.every((day) =>
                      ["mon", "tue", "wed", "thu", "fri"].includes(day),
                    )
                  ? "Weekdays"
                  : `${scheduleDays.length} days a week`}
            </Text>
          </View>
        </View>

        {/* Schedule */}
        <View className="px-6 mt-10">
          <Text className="text-lg dark:text-white font-bold">Schedule</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            When should this habit happen?
          </Text>

          <View className="flex-row mt-5">
            <TouchableOpacity
              onPress={selectEveryDay}
              activeOpacity={0.8}
              className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-full px-4 py-2 mr-2"
            >
              <Text className="font-medium dark:text-white">Every day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={selectWeekdays}
              activeOpacity={0.8}
              className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-full px-4 py-2 mr-2"
            >
              <Text className="font-medium dark:text-white">Weekdays</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={selectWeekends}
              activeOpacity={0.8}
              className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-full px-4 py-2"
            >
              <Text className="font-medium dark:text-white">Weekends</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mt-6">
            {DAYS.map((day, index) => {
              const selected = scheduleDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={`${day.value}-${index}`}
                  onPress={() => toggleDay(day.value)}
                  activeOpacity={0.8}
                  className={`w-11 h-11 rounded-full items-center justify-center ${
                    selected
                      ? "bg-black dark:bg-white"
                      : "bg-white dark:bg-[#252525] border border-black/10 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selected
                        ? "text-white dark:text-black"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-4">
            {scheduleDays.length === 0
              ? "Choose at least one day"
              : `${scheduleDays.length} ${scheduleDays.length === 1 ? "day" : "days"} selected`}
          </Text>
        </View>

        {/* Priority */}
        <View className="px-6 mt-10">
          <Text className="text-lg dark:text-white font-bold">Priority</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Mark habits that matter most.
          </Text>

          <TouchableOpacity
            onPress={() => setIsPriority(!isPriority)}
            activeOpacity={0.8}
            className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl p-4 mt-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View
                className={`w-11 h-11 rounded-xl items-center justify-center ${
                  isPriority
                    ? "bg-black dark:bg-white"
                    : "bg-black/5 dark:bg-white/10"
                }`}
              >
                <Ionicons
                  name="star"
                  size={19}
                  color={
                    isPriority
                      ? isDark
                        ? "#191919"
                        : "white"
                      : isDark
                        ? "white"
                        : "black"
                  }
                />
              </View>

              <View className="ml-3">
                <Text className="font-semibold text-black dark:text-white">
                  Priority habit
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Keep this habit visible and important.
                </Text>
              </View>
            </View>

            <View
              className={`w-12 pr-2 h-7 rounded-full justify-center ${
                isPriority
                  ? "bg-black dark:bg-white"
                  : "bg-gray-200 dark:bg-white/10"
              }`}
            >
              <View
                className={`w-5 h-5 rounded-full ${isPriority ? "bg-white dark:bg-[#191919]" : "bg-white"} ${
                  isPriority ? "ml-[22px]" : "ml-[3px]"
                }`}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Create Button */}
        <TouchableOpacity
          onPress={handleCreateHabit}
          disabled={isSaving}
          activeOpacity={0.85}
          className={`mx-6 mt-10 h-14 rounded-2xl items-center justify-center ${
            isSaving ? "bg-gray-300 dark:bg-gray-700" : "bg-black dark:bg-white"
          }`}
        >
          <Text
            className={`font-semibold text-base ${isDark ? "text-black" : "text-white"}`}
          >
            {isSaving ? "Creating habit..." : "Create habit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
