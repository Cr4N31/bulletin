import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";

import { createMeeting } from "@/db/meeting";

import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

const QUICK_TIMES = ["9:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

export default function AddMeetings() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = selectedTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  async function createMeet() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a meeting title.");
      return;
    }

    if (!selectedDate) {
      Alert.alert("Missing date", "Please select a date.");
      return;
    }

    if (!selectedTime) {
      Alert.alert("Missing time", "Please select a time.");
      return;
    }

    try {
      setIsSaving(true);

      // Store date in a consistent format
      const date = selectedDate.toISOString().split("T")[0];

      // Store readable time
      const time = selectedTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      await createMeeting(title.trim(), date, time, notes.trim());

      router.back();
    } catch (error) {
      console.error("Failed to create meeting:", error);

      Alert.alert(
        "Something went wrong",
        "We couldn't create the meeting. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      className="flex-1 bg-[#F8F8F8]"
    >
      <View className="px-6 py-5 flex-row items-center justify-between">
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-black/5 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold">New Meeting</Text>
        <TouchableOpacity
          onPress={createMeet}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text
            className={`font-semibold ${
              isSaving ? "text-gray-400" : "text-black"
            }`}
          >
            {isSaving ? "Saving..." : "Done"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        <View className="px-6 pt-8">
          <Text className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            Meeting
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What is this meeting about?"
            placeholderTextColor="#A3A3A3"
            autoFocus
            selectionColor="black"
            className="text-2xl font-bold mt-2"
          />

          <Text className="text-gray-500 mt-3 text-base">
            Keep track of the conversations that matter.
          </Text>
        </View>

        <View className="px-6 mt-8">
          <View className="bg-black rounded-[28px] p-6">
            <View className="flex-row items-center justify-between">
              {/* Icon */}
              <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
                <Ionicons name="people-outline" size={25} color="white" />
              </View>

              {/* Label */}
              <View className="rounded-full bg-white/10 px-3 py-2">
                <Text className="text-white/70 text-xs font-medium">
                  MEETING
                </Text>
              </View>
            </View>

            <Text className="text-white text-2xl font-bold mt-6">
              {title.trim() || "Your new meeting"}
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
          <Text className="text-lg font-bold">When?</Text>

          <Text className="text-gray-500 mt-1">
            Pick a date for your meeting.
          </Text>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
            className="bg-white border border-black/5 rounded-2xl mt-4 px-4 h-14 flex-row items-center"
          >
            <Ionicons name="calendar-outline" size={20} color="black" />

            <Text className="ml-3 text-base">{formattedDate}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);

                if (date) {
                  setSelectedDate(date);
                }
              }}
            />
          )}
        </View>

        <View className="px-6 mt-8">
          <Text className="text-lg font-bold">What time?</Text>

          <Text className="text-gray-500 mt-1">
            Choose when the meeting starts.
          </Text>

          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
            className="bg-white border border-black/5 rounded-2xl mt-4 px-4 h-14 flex-row items-center"
          >
            <Ionicons name="time-outline" size={20} color="black" />

            <Text className="ml-3 text-base">{formattedTime}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={(event, time) => {
                setShowTimePicker(false);

                if (time) {
                  setSelectedTime(time);
                }
              }}
            />
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              paddingTop: 12,
            }}
          >
            {QUICK_TIMES.map((quickTime) => {
              const selected = formattedTime === quickTime;

              return (
                <TouchableOpacity
                  key={quickTime}
                  onPress={() => {
                    const [timePart, modifier] = quickTime.split(" ");

                    let [hours, minutes] = timePart.split(":").map(Number);

                    if (modifier === "PM" && hours !== 12) {
                      hours += 12;
                    }

                    if (modifier === "AM" && hours === 12) {
                      hours = 0;
                    }

                    const newTime = new Date(selectedTime);

                    newTime.setHours(hours, minutes, 0, 0);

                    setSelectedTime(newTime);
                  }}
                  activeOpacity={0.8}
                  className={`rounded-full px-4 py-2 ${
                    selected ? "bg-black" : "bg-white border border-black/5"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selected ? "text-white" : "text-black"
                    }`}
                  >
                    {quickTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 mt-10">
          <Text className="text-lg font-bold">Notes</Text>

          <Text className="text-gray-500 mt-1">
            Anything you want to remember beforehand?
          </Text>

          <View className="bg-white border border-black/5 rounded-2xl mt-4 p-4">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add an agenda, people to discuss with, or anything else..."
              placeholderTextColor="#A3A3A3"
              multiline
              textAlignVertical="top"
              selectionColor="black"
              className="text-base min-h-[130px]"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={createMeet}
          disabled={isSaving}
          activeOpacity={0.85}
          className={`mx-6 mt-10 h-14 rounded-2xl items-center justify-center ${
            isSaving ? "bg-gray-300" : "bg-black"
          }`}
        >
          <Text className="text-white font-semibold text-base">
            {isSaving ? "Creating meeting..." : "Create meeting"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
