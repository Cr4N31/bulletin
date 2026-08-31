import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, Text, Animated, Easing } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";

export default function FloatingActionButton() {
  const [toggle, setToggle] = useState(false);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const ACTIONS = [
    {
      label: "Meetings",
      icon: "people-outline",
      route: "/(screens)/addScreens/addMeetings",
      type: "meeting",
    },
    {
      label: "Projects",
      icon: "folder-outline",
      route: "/(screens)/addScreens/addProject",
      type: "project",
    },
    {
      label: "Habits",
      icon: "checkmark-circle-outline",
      route: "/(screens)/addScreens/addHabits",
      type: "habit",
    },
  ];

  const animations = useRef(ACTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (toggle) {
      Animated.stagger(
        70,
        animations.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 70,
            friction: 7,
          }),
        ),
      ).start();
    } else {
      Animated.stagger(
        40,
        [...animations].reverse().map((anim) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 120,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  }, [toggle]);

  const handleActionPress = (action: (typeof ACTIONS)[number]) => {
    setToggle(false);
    router.push({
      pathname: action.route as any,
      params: {
        type: action.type,
      },
    });
  };

  return (
    <View className="absolute bottom-[100px] right-5">
      {/* Action bubbles */}
      {ACTIONS.map((action, index) => {
        const translateY = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, -(index + 1) * 72],
        });

        const scale = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        });

        return (
          <Animated.View
            key={action.label}
            pointerEvents={toggle ? "auto" : "none"}
            style={{
              position: "absolute",
              bottom: 0,
              right: 4,
              opacity: animations[index],
              transform: [{ translateY }, { scale }],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-row items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => handleActionPress(action)}
            >
              {/* Label */}
              <View className="mr-3 rounded-full bg-black/80 dark:bg-[#252525] px-4 py-2">
                <Text className="text-white font-medium">{action.label}</Text>
              </View>

              {/* Icon bubble */}
              <View
                className="bg-white border border-black/10 dark:bg-[#252525]"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={isDark ? "#fff" : "#000"}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity
        onPress={() => setToggle((prev) => !prev)}
        className="w-16 h-16 bg-white/30 dark:bg-[#252525] border border-black/5 backdrop-blur rounded-full justify-center items-center"
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: toggle ? "45deg" : "0deg",
              },
            ],
          }}
        >
          <Ionicons name="add" size={25} color={isDark ? "#fff" : "#000"} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
