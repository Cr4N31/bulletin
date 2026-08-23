import { Stack } from "expo-router";
import { View } from "react-native";
import NavBar from "@/components/NavBar";

export default function ScreenLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      <NavBar />
    </View>
  );
}
