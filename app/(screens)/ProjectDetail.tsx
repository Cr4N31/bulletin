import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import {
  getProject,
  updateProjectProgress,
  deleteProject,
  Project,
} from "@/db/project";
import {
  addProgressLog,
  getProgressLogs,
  ProjectProgressLog,
} from "@/db/projectProgressLog";

import { logActivity } from "@/db/activityLog";

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [project, setProject] = useState<Project | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProjectProgressLog[]>([]);
  const [increment, setIncrement] = useState("");
  const [note, setNote] = useState("");

  const projectId = Number(id);

  useFocusEffect(
    useCallback(() => {
      if (!projectId) return;
      getProject(projectId).then(setProject);
      getProgressLogs(projectId).then(setProgressLogs);
    }, [projectId]),
  );

  async function refresh() {
    const updated = await getProject(projectId);
    setProject(updated);
    const logs = await getProgressLogs(projectId);
    setProgressLogs(logs);
  }

  async function handleAddProgress() {
    if (!project) return;
    const addAmount = parseInt(increment, 10);
    if (!addAmount || addAmount <= 0) return;

    const newProgress = Math.min(project.progress + addAmount, 100);
    await updateProjectProgress(projectId, newProgress);
    await addProgressLog(projectId, addAmount, note);
    await logActivity(
      "project",
      "progress",
      `Added ${addAmount}% to "${project.title}"${note.trim() ? ` — ${note.trim()}` : ""}`,
    );
    setIncrement("");
    setNote("");
    await refresh();
  }

  async function handleMarkCompleted() {
    if (!project) return;
    await updateProjectProgress(projectId, 100);
    await logActivity(
      "project",
      "completed",
      `Marked "${project.title}" as completed`,
    );
    await refresh();
  }

  async function handleDelete() {
    Alert.alert("Delete project?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteProject(projectId);
          router.back();
        },
      },
    ]);
  }

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F8F8] dark:bg-[#191919] items-center justify-center">
        <Text className="text-black/30 dark:text-white/30">Loading...</Text>
      </SafeAreaView>
    );
  }

  const isCompleted = project.status === "Completed";

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
          {project.title}
        </Text>
        <TouchableOpacity onPress={handleDelete} className="p-2">
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <View className="px-6 mt-2">
        <View className="bg-black dark:bg-[#252525] rounded-[28px] p-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-white/60 text-sm">{project.status}</Text>
            <View className="rounded-full bg-white/10 px-3 py-1">
              <Text className="text-white/70 text-xs font-medium">
                {project.priority}
              </Text>
            </View>
          </View>

          <Text className="text-white text-4xl font-bold mt-3">
            {project.progress}%
          </Text>

          <View className="h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
            <View
              className="h-2 bg-white rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </View>
        </View>
      </View>

      {project.notes ? (
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold mb-2 text-black dark:text-white">
            Notes
          </Text>
          <View className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <Text className="text-black/70 dark:text-white/70">
              {project.notes}
            </Text>
          </View>
        </View>
      ) : null}

      {!isCompleted && (
        <View className="px-6 mt-8">
          <Text className="text-lg font-bold mb-2 text-black dark:text-white">
            Log progress
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mb-4">
            Add how much progress you've made, and what changed.
          </Text>

          <View className="flex-row gap-3 mb-3">
            <TextInput
              value={increment}
              onChangeText={(t) => setIncrement(t.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 10"
              placeholderTextColor="#A3A3A3"
              keyboardType="number-pad"
              className="flex-1 bg-white dark:bg-[#252525] border border-black/5 dark:border-white/5 rounded-2xl px-4 h-14 text-base text-black dark:text-white"
            />
            <TouchableOpacity
              onPress={handleAddProgress}
              activeOpacity={0.85}
              className="bg-black dark:bg-[#252525] rounded-2xl px-6 h-14 items-center justify-center"
            >
              <Text className="text-white font-semibold">Add %</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What changed? (optional)"
            placeholderTextColor="#A3A3A3"
            multiline
            textAlignVertical="top"
            className="bg-white dark:bg-[#252525] border border-black/5 dark:border-white/5 rounded-2xl p-4 text-base text-black dark:text-white min-h-[80px]"
          />

          <TouchableOpacity
            onPress={handleMarkCompleted}
            activeOpacity={0.85}
            className="mt-4 h-14 rounded-2xl items-center justify-center flex-row gap-2 bg-white dark:bg-[#252525] border border-black/10 dark:border-white/10"
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={isDark ? "#fff" : "#000"}
            />
            <Text className="font-semibold text-base text-black dark:text-white">
              Mark completed
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isCompleted && (
        <View className="px-6 mt-8 items-center">
          <Ionicons
            name="checkmark-circle"
            size={40}
            color={isDark ? "#fff" : "#000"}
          />
          <Text className="text-black/50 dark:text-white/50 mt-2">
            This project is complete
          </Text>
        </View>
      )}

      {progressLogs.length > 0 && (
        <View className="px-6 mt-8">
          <Text className="text-lg font-bold mb-3 text-black dark:text-white">
            History
          </Text>
          {progressLogs.map((log) => (
            <View
              key={log.id}
              className="flex-row gap-3 py-3 border-b border-black/5 dark:border-white/5"
            >
              <View className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 items-center justify-center">
                <Text className="text-xs font-bold text-black dark:text-white">
                  +{log.amountAdded}
                </Text>
              </View>
              <View className="flex-1">
                {log.note ? (
                  <Text className="text-sm text-black dark:text-white">
                    {log.note}
                  </Text>
                ) : (
                  <Text className="text-sm text-black/40 dark:text-white/40">
                    Added {log.amountAdded}% progress
                  </Text>
                )}
                <Text className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                  {new Date(log.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
