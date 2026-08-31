import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getMeetings, Meeting } from "@/db/meeting";
import { useColorScheme } from "nativewind";
import { parseMeetingDateTime } from "@/utils/meetingTime";

function isMeetingPast(meeting: Meeting): boolean {
  return parseMeetingDateTime(meeting).getTime() < Date.now();
}

export default function MeetingsList() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useFocusEffect(
    useCallback(() => {
      getMeetings().then(setMeetings);
    }, []),
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
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
        <Text className="text-2xl dark:text-white font-bold">Meetings</Text>
      </View>

      <FlatList
        data={meetings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
        renderItem={({ item }) => {
          const past = isMeetingPast(item);
          return (
            <TouchableOpacity
              onPress={() =>
                router.push(`/(screens)/MeetingDetail?id=${item.id}` as any)
              }
              activeOpacity={0.7}
              className={`flex-row items-center gap-3 p-4 mb-2 rounded-2xl border ${
                past
                  ? "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5"
                  : "bg-white dark:bg-[#252525] border-black/5 dark:border-white/5"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  past
                    ? "bg-black/10 dark:bg-white/10"
                    : "bg-black dark:bg-[#ada9a3]"
                }`}
              >
                <Ionicons
                  name={past ? "checkmark" : "people-outline"}
                  size={18}
                  color={
                    past
                      ? isDark
                        ? "#ffffff60"
                        : "#00000060"
                      : isDark
                        ? "#191919"
                        : "white"
                  }
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-semibold ${
                    past
                      ? "text-black/40 dark:text-white/40"
                      : "text-black dark:text-white"
                  }`}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                  {item.date} · {item.time} {past ? "· Completed" : ""}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="text-black/30 dark:text-white/30">
              No meetings logged yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
