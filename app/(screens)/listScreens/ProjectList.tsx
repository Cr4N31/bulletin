import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getProjects, Project } from "@/db/project";

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useFocusEffect(
    useCallback(() => {
      getProjects().then(setProjects);
    }, []),
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-[#F8F8F8]"
    >
      <View className="px-6 py-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/5 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Projects</Text>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 24, flexGrow: 1 }}
        renderItem={({ item }) => {
          const done = item.status === "Completed";
          return (
            <TouchableOpacity
              onPress={() =>
                router.push(`/(screens)/ProjectDetail?id=${item.id}` as any)
              }
              activeOpacity={0.7}
              className={`flex-row items-center gap-3 p-4 mb-2 rounded-2xl border ${
                done ? "bg-black/5 border-black/5" : "bg-white border-black/5"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  done ? "bg-black/10" : "bg-black"
                }`}
              >
                <Ionicons
                  name={done ? "checkmark" : "folder-outline"}
                  size={18}
                  color={done ? "#00000060" : "white"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-semibold ${done ? "text-black/40" : "text-black"}`}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-black/40 mt-0.5">
                  {item.status} · {item.progress}%
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-black/30">No projects logged yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
