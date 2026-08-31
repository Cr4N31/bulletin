import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { getMeeting, deleteMeeting, Meeting } from "@/db/meeting";
import { parseMeetingDateTime } from "@/utils/meetingTime";

function getCountdown(meeting: Meeting) {
  const target = parseMeetingDateTime(meeting).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { isPast: true, days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { isPast: false, days, hours, minutes };
}

export default function MeetingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [, setNow] = useState(Date.now());

  const meetingId = Number(id);

  useFocusEffect(
    useCallback(() => {
      if (!meetingId) return;
      getMeeting(meetingId).then(setMeeting);
    }, [meetingId]),
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleDelete() {
    Alert.alert("Delete meeting?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMeeting(meetingId);
          router.back();
        },
      },
    ]);
  }

  if (!meeting) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F8F8] dark:bg-[#191919] items-center justify-center">
        <Text className="text-black/30 dark:text-white/30">Loading...</Text>
      </SafeAreaView>
    );
  }

  const countdown = getCountdown(meeting);

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
          {meeting.title}
        </Text>
        <TouchableOpacity onPress={handleDelete} className="p-2">
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <View className="px-6 mt-2">
        <View className="bg-black dark:bg-[#252525] rounded-[28px] p-6">
          {countdown.isPast ? (
            <>
              <Ionicons name="checkmark-circle" size={32} color="#fff" />
              <Text className="text-white text-xl font-bold mt-3">
                Meeting completed
              </Text>
            </>
          ) : (
            <>
              <Text className="text-white/60 text-sm">Starts in</Text>
              <View className="flex-row items-end gap-4 mt-2">
                {countdown.days > 0 && (
                  <View>
                    <Text className="text-white text-4xl font-bold">
                      {countdown.days}
                    </Text>
                    <Text className="text-white/50 text-xs mt-1">days</Text>
                  </View>
                )}
                <View>
                  <Text className="text-white text-4xl font-bold">
                    {countdown.hours}
                  </Text>
                  <Text className="text-white/50 text-xs mt-1">hrs</Text>
                </View>
                <View>
                  <Text className="text-white text-4xl font-bold">
                    {countdown.minutes}
                  </Text>
                  <Text className="text-white/50 text-xs mt-1">min</Text>
                </View>
              </View>
            </>
          )}

          <View className="flex-row items-center mt-5 pt-5 border-t border-white/10">
            <Ionicons
              name="calendar-outline"
              size={15}
              color="rgba(255,255,255,0.6)"
            />
            <Text className="text-white/60 ml-2">{meeting.date}</Text>
            <View className="w-1 h-1 rounded-full bg-white/30 mx-3" />
            <Ionicons
              name="time-outline"
              size={15}
              color="rgba(255,255,255,0.6)"
            />
            <Text className="text-white/60 ml-2">{meeting.time}</Text>
          </View>
        </View>
      </View>

      {meeting.notes ? (
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold mb-2 text-black dark:text-white">
            Notes
          </Text>
          <View className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <Text className="text-black/70 dark:text-white/70">
              {meeting.notes}
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
