import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import { useUser } from "@/context/UserContext";
import { useColorScheme } from "nativewind";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userName } = useUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const TABS = [
    {
      name: "Home",
      route: "/(screens)",
      icon: "home-outline" as const,
      activeIcon: "home" as const,
    },
    {
      name: "Workspace",
      route: "/(screens)/workspace",
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
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Left: user avatar */}
      <View style={{ flex: 1, alignItems: "flex-start" }}>
        <View
          className="bg-white/30 dark:bg-[#252525]"
          style={{
            borderRadius: 999,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.06)",
            padding: 16,
          }}
        >
          <Text className="text-black dark:text-white mx-1 text-sm font-semibold">
            {initials || "US"}
          </Text>
        </View>
      </View>

      {/* Center: nav pills, grouped close together */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {TABS.map((tab) => {
          const isActive =
            tab.route === "/(screens)"
              ? pathname === "/" || pathname === "/(screens)"
              : pathname.includes(tab.route.split("/").pop()!);

          return (
            <View
              className="bg-white/30 dark:bg-[#252525]"
              key={tab.name}
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
                  color={
                    isActive
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : isDark
                        ? "#aaa"
                        : "#666"
                  }
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Right: settings, placeholder for now */}
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <View
          className="bg-white/30 dark:bg-[#252525]"
          style={{
            borderRadius: 999,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.06)",
            padding: 5,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(screens)/Settings" as any)}
            activeOpacity={0.7}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
