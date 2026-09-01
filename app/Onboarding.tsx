import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { setOnboardingComplete } from "@/utils/onboarding";
import { requestNotificationPermission } from "@/utils/notifications";
import { useUser } from "@/context/UserContext";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "checkmark-circle-outline" as const,
    title: "Track what matters",
    body: "Habits, projects, and meetings — all in one place, without paying for a database you should already have.",
  },
  {
    icon: "stats-chart-outline" as const,
    title: "See your progress",
    body: "A GitHub-style streak graph, progress bars, and a full history of everything you've logged.",
  },
  {
    icon: "notifications-outline" as const,
    title: "Never miss a beat",
    body: "Get reminded about meetings and habits, right when you need it.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { updateUserName } = useUser();

  const [index, setIndex] = useState(0);
  const [showNameStep, setShowNameStep] = useState(false);
  const [name, setName] = useState("");
  const listRef = useRef<FlatList>(null);

  const isLastSlide = index === SLIDES.length - 1;

  function goToSlide(i: number) {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  }

  async function handleFinish() {
    if (name.trim()) {
      await updateUserName(name.trim());
    }
    //await requestNotificationPermission();
    await setOnboardingComplete();
    router.replace("/(screens)");
  }

  async function handleSkip() {
    await setOnboardingComplete();
    router.replace("/(screens)");
  }

  if (showNameStep) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        className="flex-1 bg-white dark:bg-[#191919]"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-8 justify-center">
            <View className="w-24 h-24 rounded-full bg-black dark:bg-white items-center justify-center mb-8 self-center">
              <Ionicons
                name="person-outline"
                size={40}
                color={isDark ? "#191919" : "white"}
              />
            </View>

            <Text className="text-3xl font-bold text-black dark:text-white text-center">
              What should we call you?
            </Text>
            <Text className="text-base text-black/50 dark:text-white/50 text-center mt-3 mb-8">
              This is just so things feel a little more like yours.
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#A3A3A3"
              autoFocus
              selectionColor={isDark ? "white" : "black"}
              className="bg-[#F8F8F8] dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl px-4 h-14 text-base text-center text-black dark:text-white"
            />
          </View>

          <View className="px-6 mb-4">
            <TouchableOpacity
              onPress={handleFinish}
              activeOpacity={0.85}
              className="h-14 rounded-2xl items-center justify-center bg-black dark:bg-white"
            >
              <Text
                className={`font-semibold text-base ${isDark ? "text-black" : "text-white"}`}
              >
                Get started
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFinish} className="mt-3">
              <Text className="text-center text-black/30 dark:text-white/30 text-sm">
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-white dark:bg-[#191919]"
    >
      <View className="flex-row justify-end px-6 pt-2">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-black/40 dark:text-white/40 font-medium">
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View
            style={{ width }}
            className="flex-1 items-center justify-center px-10"
          >
            <View className="w-24 h-24 rounded-full bg-black dark:bg-white items-center justify-center mb-8">
              <Ionicons
                name={item.icon}
                size={40}
                color={isDark ? "#191919" : "white"}
              />
            </View>
            <Text className="text-3xl font-bold text-black dark:text-white text-center">
              {item.title}
            </Text>
            <Text className="text-base text-black/50 dark:text-white/50 text-center mt-4 leading-6">
              {item.body}
            </Text>
          </View>
        )}
      />

      <View className="flex-row justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
            <View
              className={`h-2 rounded-full ${
                i === index
                  ? "w-6 bg-black dark:bg-white"
                  : "w-2 bg-black/15 dark:bg-white/15"
              }`}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-6 mb-4">
        <TouchableOpacity
          onPress={
            isLastSlide
              ? () => setShowNameStep(true)
              : () => goToSlide(index + 1)
          }
          activeOpacity={0.85}
          className="h-14 rounded-2xl items-center justify-center bg-black dark:bg-white"
        >
          <Text
            className={`font-semibold text-base ${isDark ? "text-black" : "text-white"}`}
          >
            {isLastSlide ? "Continue" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
