import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getHabits, Habit } from "@/db/habit";
import { useColorScheme } from "nativewind";

export default function HabitsList() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useFocusEffect(
    useCallback(() => {
      getHabits().then(setHabits);
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
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text className="text-2xl text-black dark:text-white font-bold">
          Habits
        </Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/(screens)/HabitDetail?id=${item.id}` as any)
            }
            activeOpacity={0.7}
            className="flex-row items-center gap-3 p-4 mb-2 rounded-2xl border bg-white dark:bg-[#252525] border-black/5"
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-black dark:bg-[#ADA9A3]">
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={isDark ? "#000" : "#fff"}
              />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-black dark:text-white">
                {item.title}
              </Text>
            </View>
            {item.isPriority && (
              <Ionicons
                name="star"
                size={16}
                color={isDark ? "#ada9a3" : "#000"}
              />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-black/30">No habits logged yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
