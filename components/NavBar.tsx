import { Ionicons } from "@react-native-vector-icons/ionicons";
import { TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import { View } from "react-native";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const TABS = [
    {
      name: "Home",
      route: "/(screens)",
      icon: "home-outline" as const,
      activeIcon: "home" as const,
    },
    {
      name: "Meetings",
      route: "/(screens)/meeting",
      icon: "calendar-outline" as const,
      activeIcon: "calendar" as const,
    },
    {
      name: "Activity",
      route: "/(screens)/activity",
      icon: "notifications-outline" as const,
      activeIcon: "notifications" as const,
    },
  ];

  return (
    <View
      style={{
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: "row",
        gap: 16,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {TABS.map((tab) => {
        const isActive =
          tab.route === "/(screens)"
            ? pathname === "/" || pathname === "/(screens)"
            : pathname.includes(tab.route.split("/").pop()!);

        return (
          <BlurView
            key={tab.name}
            intensity={60}
            tint="prominent"
            style={{
              borderRadius: 999,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <TouchableOpacity
              onPress={() => router.replace(tab.route as any)}
              activeOpacity={0.7}
              style={{ padding: 14 }}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? "#000" : "#666"}
              />
            </TouchableOpacity>
          </BlurView>
        );
      })}
    </View>
  );
}
