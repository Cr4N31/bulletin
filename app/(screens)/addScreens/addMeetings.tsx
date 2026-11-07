import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { logActivity } from "@/db/activityLog";
import { createMeeting } from "@/db/meeting";
import {
  requestNotificationPermission,
  scheduleMeetingReminder,
} from "@/utils/notifications";
import { parseDateTime } from "@/utils/meetingTime";
import { translate } from "@/utils/localization";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "nativewind";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const QUICK_TIMES = [9, 10, 12, 14, 16];

export default function AddMeetings() {
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { language } = useUser();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const initialDate =
    typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? new Date(
          Number(dateParam.slice(0, 4)),
          Number(dateParam.slice(5, 7)) - 1,
          Number(dateParam.slice(8, 10)),
        )
      : new Date();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const formattedDate = selectedDate.toLocaleDateString(language, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = selectedTime.toLocaleTimeString(language, {
    hour: "numeric",
    minute: "2-digit",
  });

  async function createMeet() {
    if (!title.trim()) {
      Alert.alert(t("missingTitle"), t("enterMeetingTitle"));
      return;
    }

    setIsSaving(true);
    const date = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, "0"),
      String(selectedDate.getDate()).padStart(2, "0"),
    ].join("-");
    const time = selectedTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    let meetingId: number;
    try {
      meetingId = await createMeeting(
        title.trim(),
        date,
        time,
        notes.trim(),
      );
      await logActivity(
        "meeting",
        "created",
        `Scheduled "${title}" for ${date} at ${time}`,
      );
    } catch (error) {
      console.error("Failed to save meeting:", error);
      Alert.alert(t("somethingWentWrong"), t("meetingCreateError"));
      setIsSaving(false);
      return;
    }

    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        const meetingDateTime = parseDateTime(date, time);
        const reminderTime = new Date(
          meetingDateTime.getTime() - 30 * 60 * 1000,
        );
        await scheduleMeetingReminder(meetingId, title.trim(), reminderTime);
      }
    } catch (error) {
      console.error("Meeting saved, but reminder setup failed:", error);
      Alert.alert(t("meetingSaved"), t("reminderNotSet"), [
        { text: t("done"), onPress: () => router.back() },
      ]);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    router.back();
  }

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      className="flex-1 bg-[#F8F8F8] dark:bg-[#191919]"
    >
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

        <Text className="text-lg font-semibold text-black dark:text-white">
          {t("newMeeting")}
        </Text>
        <TouchableOpacity
          onPress={createMeet}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text
            className={`font-semibold ${isSaving ? "text-gray-400" : "text-black dark:text-white"}`}
          >
            {isSaving ? t("saving") : t("done")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View className="px-6 pt-8">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
            {t("meeting")}
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t("meetingPrompt")}
            placeholderTextColor="#A3A3A3"
            autoFocus
            selectionColor={isDark ? "white" : "black"}
            className="text-2xl font-bold mt-2 text-black dark:text-white"
          />

          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
            {t("meetingDescription")}
          </Text>
        </View>

        <View className="px-6 mt-8">
          <View className="bg-black dark:bg-[#252525] rounded-[28px] p-6">
            <View className="flex-row items-center justify-between">
              <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
                <Ionicons name="people-outline" size={25} color="white" />
              </View>
              <View className="rounded-full bg-white/10 px-3 py-2">
                <Text className="text-white/70 text-xs font-medium">
                  {t("meetingBadge")}
                </Text>
              </View>
            </View>

            <Text className="text-white text-2xl font-bold mt-6">
              {title.trim() || t("newMeetingPreview")}
            </Text>

            <View className="flex-row items-center mt-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color="rgba(255,255,255,0.6)"
                />
                <Text className="text-white/60 ml-2">{formattedDate}</Text>
              </View>
              <View className="w-1 h-1 rounded-full bg-white/30 mx-3" />
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={15}
                  color="rgba(255,255,255,0.6)"
                />
                <Text className="text-white/60 ml-2">{formattedTime}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 mt-10">
          <Text className="text-lg font-bold text-black dark:text-white">
            {t("when")}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {t("pickMeetingDate")}
          </Text>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
            className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl mt-4 px-4 h-14 flex-row items-center"
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isDark ? "white" : "black"}
            />
            <Text className="ml-3 text-base text-black dark:text-white">
              {formattedDate}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        <View className="px-6 mt-8">
          <Text className="text-lg font-bold text-black dark:text-white">
            {t("whatTime")}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {t("pickMeetingTime")}
          </Text>

          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
            className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl mt-4 px-4 h-14 flex-row items-center"
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={isDark ? "white" : "black"}
            />
            <Text className="ml-3 text-base text-black dark:text-white">
              {formattedTime}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={(event, time) => {
                setShowTimePicker(false);
                if (time) setSelectedTime(time);
              }}
            />
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingTop: 12 }}
          >
            {QUICK_TIMES.map((hour) => {
              const quickTime = new Date(2000, 0, 1, hour).toLocaleTimeString(
                language,
                { hour: "numeric", minute: "2-digit" },
              );
              const selected =
                selectedTime.getHours() === hour &&
                selectedTime.getMinutes() === 0;
              return (
                <TouchableOpacity
                  key={hour}
                  onPress={() => {
                    const newTime = new Date(selectedTime);
                    newTime.setHours(hour, 0, 0, 0);
                    setSelectedTime(newTime);
                  }}
                  activeOpacity={0.8}
                  className={`rounded-full px-4 py-2 ${
                    selected
                      ? "bg-black dark:bg-white"
                      : "bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`font-medium ${selected ? "text-white dark:text-black" : "text-black dark:text-white"}`}
                  >
                    {quickTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 mt-10">
          <Text className="text-lg font-bold text-black dark:text-white">
            {t("notes")}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Anything you want to remember beforehand?
          </Text>

          <View className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl mt-4 p-4">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={t("notesPrompt")}
              placeholderTextColor="#A3A3A3"
              multiline
              textAlignVertical="top"
              selectionColor={isDark ? "white" : "black"}
              className="text-base min-h-[130px] text-black dark:text-white"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={createMeet}
          disabled={isSaving}
          activeOpacity={0.85}
          className={`mx-6 mt-10 h-14 rounded-2xl items-center justify-center ${
            isSaving ? "bg-gray-300 dark:bg-gray-700" : "bg-black dark:bg-white"
          }`}
        >
          <Text
            className={`font-semibold text-base ${isDark ? "text-black" : "text-white"}`}
          >
            {isSaving ? t("creatingMeeting") : t("createMeeting")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
