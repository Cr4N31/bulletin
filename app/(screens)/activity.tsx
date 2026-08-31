import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { getRecentActivity, ActivityLog } from "@/db/activityLog";

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const TYPE_ICON: Record<ActivityLog["type"], keyof typeof Ionicons.glyphMap> = {
  habit: "checkmark-circle-outline",
  meeting: "people-outline",
  project: "folder-outline",
};

export default function Activity() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRecentActivity(50).then(setLogs);
    }, []),
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-white dark:bg-[#191919]"
    >
      <View className="px-6 py-5">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Activity
        </Text>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
        renderItem={({ item }) => (
          <View className="flex-row items-start gap-3 py-3">
            <View className="w-9 h-9 rounded-full bg-black dark:bg-white items-center justify-center mt-0.5">
              <Ionicons
                name={TYPE_ICON[item.type]}
                size={16}
                color={isDark ? "#191919" : "white"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-black dark:text-white">
                {item.description}
              </Text>
              <Text className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                {getRelativeTime(item.createdAt)}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-black/5 dark:bg-white/5" />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-black/30 dark:text-white/30">
              No activity yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
