import { Stack, usePathname } from "expo-router";
import { View } from "react-native";

import NavBar from "@/components/NavBar";
import { useColorScheme } from "nativewind";

export default function ScreenLayout() {
  const pathname = usePathname();

  const hideNavRoutes = ["/addHabits", "/addMeetings", "/addProject"];

  const hideNav = hideNavRoutes.some((route) => pathname.includes(route));
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? "#191919" : "#ffffff",
          },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>

      {!hideNav && <NavBar />}
    </View>
  );
}
