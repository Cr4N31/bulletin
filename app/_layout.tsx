import "../global.css";
import { Stack } from "expo-router";
import { initDatabase } from "@/db/schema";
import { useEffect } from "react";
import { UserProvider } from "@/context/UserContext";
import { useColorScheme } from "nativewind";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <UserProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? "#191919" : "#ffffff",
          },
        }}
      >
        <Stack.Screen name="(screens)" />
      </Stack>
    </UserProvider>
  );
}
