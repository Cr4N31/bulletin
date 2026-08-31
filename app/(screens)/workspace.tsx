import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import FloatingActionButton from "@/components/FloatingActionButton";
import { getHabits } from "@/db/habit";
import { getMeetings } from "@/db/meeting";
import { getProjects } from "@/db/project";

const FOLDERS = [
  {
    key: "meetings",
    label: "Meetings",
    icon: "people-outline",
    route: "/(screens)/listScreens/MeetingList",
  },
  {
    key: "projects",
    label: "Projects",
    icon: "folder-outline",
    route: "/(screens)/listScreens/ProjectList",
  },
  {
    key: "habits",
    label: "Habits",
    icon: "checkmark-circle-outline",
    route: "/(screens)/listScreens/HabitsList",
  },
] as const;

export default function Workspace() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [counts, setCounts] = useState<Record<string, number>>({
    meetings: 0,
    projects: 0,
    habits: 0,
  });

  useFocusEffect(
    useCallback(() => {
      Promise.all([getMeetings(), getProjects(), getHabits()]).then(
        ([meetings, projects, habits]) => {
          setCounts({
            meetings: meetings.length,
            projects: projects.length,
            habits: habits.length,
          });
        },
      );
    }, []),
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-white dark:bg-[#191919]"
    >
      <View className="flex-1">
        <View className="p-8">
          <Text className="font-bold text-4xl text-black dark:text-white">
            What are we logging today?
          </Text>
        </View>

        <View className="px-6 gap-3">
          {FOLDERS.map((folder) => (
            <TouchableOpacity
              key={folder.key}
              onPress={() => router.push(folder.route as any)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between bg-white dark:bg-[#252525] border border-black/5 dark:border-white/5 rounded-2xl p-5"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-2xl bg-black dark:bg-[#252525] items-center justify-center">
                  <Ionicons
                    name={folder.icon as any}
                    size={22}
                    color={isDark ? "#ADA9A3" : "white"}
                  />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-black dark:text-white">
                    {folder.label}
                  </Text>
                  <Text className="text-sm text-black/40 dark:text-white/40 mt-0.5">
                    {counts[folder.key]} logged
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#ffffff30" : "#00000030"}
              />
            </TouchableOpacity>
          ))}
        </View>

        <FloatingActionButton />
      </View>
    </SafeAreaView>
  );
}
