import { Stack, usePathname } from "expo-router";
import { View } from "react-native";

import NavBar from "@/components/NavBar";

export default function ScreenLayout() {
  const pathname = usePathname();

  const hideNavRoutes = ["/addHabits", "/addMeetings", "/addProject"];

  const hideNav = hideNavRoutes.some((route) => pathname.includes(route));

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>

      {!hideNav && <NavBar />}
    </View>
  );
}
