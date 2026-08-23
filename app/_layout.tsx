import "../global.css";
import { Stack } from "expo-router";
import { initDatabase } from "@/db/schema";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(screens)" />
    </Stack>
  );
}
