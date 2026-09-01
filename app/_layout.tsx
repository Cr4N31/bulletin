import "../global.css";
import { Stack, Redirect } from "expo-router";
import { initDatabase } from "@/db/schema";
import { useEffect, useState } from "react";
import { UserProvider } from "@/context/UserContext";
import { useColorScheme } from "nativewind";
import { hasCompletedOnboarding } from "@/utils/onboarding";

export default function RootLayout() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    initDatabase();
    hasCompletedOnboarding().then(setOnboarded);
  }, []);

  if (onboarded === null) {
    return null;
  }

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
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(screens)" />
      </Stack>
      {!onboarded && <Redirect href="/Onboarding" />}
    </UserProvider>
  );
}
