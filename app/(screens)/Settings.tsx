import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { View, Text, TextInput, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { requestNotificationPermission } from "@/utils/notifications";

export default function Settings() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const { userName, updateUserName } = useUser();

  async function sendTestNotification() {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log("Notification permission not granted");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: { title: "Test", body: "If you see this, notifications work" },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  }

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
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-black dark:text-white">
          Settings
        </Text>
      </View>

      <View className="px-6 mt-4">
        <Text className="text-xs font-medium text-gray-400 mb-2">
          YOUR NAME
        </Text>
        <TextInput
          value={userName}
          onChangeText={updateUserName}
          placeholder="Enter your name"
          placeholderTextColor="#A3A3A3"
          className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl px-4 h-14 text-base text-black dark:text-white"
        />
      </View>

      <View className="px-6 mt-8">
        <Text className="text-xs font-medium text-gray-400 mb-2">
          PREFERENCES
        </Text>
        <View className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-black dark:bg-[#252525] items-center justify-center">
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={18}
                  color={isDark ? "#000" : "#fff"}
                />
              </View>
              <Text className="text-sm font-medium text-black dark:text-white">
                Dark mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleColorScheme}
              trackColor={{ false: "#D1D5DB", true: "#ADA9A3" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View className="px-6 mt-8">
        <Text className="text-xs font-medium text-gray-400 mb-2">ABOUT</Text>
        <View className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-sm text-black dark:text-white">Version</Text>
            <Text className="text-sm text-gray-400">{appVersion}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={sendTestNotification}
          className="bg-white dark:bg-gray-900 border border-black/5 dark:border-white/10 rounded-2xl p-4 mt-3"
        >
          <Text className="text-sm text-black dark:text-white text-center">
            Send test notification
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
