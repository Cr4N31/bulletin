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
import { useColorScheme } from "nativewind";
import { createProject, Project } from "@/db/project";
import { logActivity } from "@/db/activityLog";

const PRIORITIES: Project["priority"][] = ["Low", "Medium", "High"];

export default function AddProject() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Project["priority"]>("Medium");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreateProject() {
    if (!title.trim()) {
      Alert.alert("Project name required", "Give your project a name first.");
      return;
    }

    try {
      setIsSaving(true);
      await createProject(
        title.trim(),
        "Not Started",
        priority,
        0,
        notes.trim(),
      );
      await logActivity("project", "created", `Started "${title.trim()}"`);
      router.back();
    } catch (error) {
      console.error("Failed to create project:", error);
      Alert.alert(
        "Something went wrong",
        "We couldn't create this project. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
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
          New Project
        </Text>

        <TouchableOpacity
          onPress={handleCreateProject}
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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View className="px-6 pt-8">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
            Project
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What are you working on?"
            placeholderTextColor="#A3A3A3"
            autoFocus
            selectionColor={isDark ? "white" : "black"}
            className="text-2xl font-bold mt-2 text-black dark:text-white"
          />

          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
            Track it from start to finish.
          </Text>
        </View>

        <View className="px-6 mt-8">
          <View className="bg-black dark:bg-[#252525] rounded-[28px] p-6">
            <View className="flex-row items-center justify-between">
              <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
                <Ionicons name="folder-outline" size={25} color="white" />
              </View>
              <View className="rounded-full bg-white/10 px-3 py-2">
                <Text className="text-white/70 text-xs font-medium">
                  PROJECT
                </Text>
              </View>
            </View>

            <Text className="text-white text-2xl font-bold mt-6">
              {title.trim() || "Your new project"}
            </Text>

            <Text className="text-white/50 mt-2">
              {priority} priority · Not started
            </Text>
          </View>
        </View>

        <View className="px-6 mt-10">
          <Text className="text-lg font-bold text-black dark:text-white">
            Priority
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            How important is this project?
          </Text>

          <View className="flex-row mt-5 gap-2">
            {PRIORITIES.map((p) => {
              const selected = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-2xl py-3 items-center ${
                    selected
                      ? "bg-black dark:bg-white"
                      : "bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`font-semibold ${selected ? "text-white dark:text-black" : "text-black dark:text-white"}`}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="px-6 mt-10">
          <Text className="text-lg font-bold text-black dark:text-white">
            Notes
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Any details worth remembering?
          </Text>

          <View className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/10 rounded-2xl mt-4 p-4">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Scope, deadline, next steps..."
              placeholderTextColor="#A3A3A3"
              multiline
              textAlignVertical="top"
              selectionColor={isDark ? "white" : "black"}
              className="text-base min-h-[130px] text-black dark:text-white"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCreateProject}
          disabled={isSaving}
          activeOpacity={0.85}
          className={`mx-6 mt-10 h-14 rounded-2xl items-center justify-center ${
            isSaving ? "bg-gray-300 dark:bg-gray-700" : "bg-black dark:bg-white"
          }`}
        >
          <Text
            className={`font-semibold text-base ${isDark ? "text-black" : "text-white"}`}
          >
            {isSaving ? "Creating project..." : "Create project"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
