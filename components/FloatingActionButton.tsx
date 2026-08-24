import { Ionicons } from "@react-native-vector-icons/ionicons";
import { View, TouchableOpacity, Text, Animated, Easing } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

export default function FloatingActionButton() {
  const [toggle, setToggle] = useState(false);
  const router = useRouter();

  const ACTIONS = [
    {
      label: "Meetings",
      icon: "people-outline",
      route: "/addMeetings",
      type: "meeting",
    },
    {
      label: "Projects",
      icon: "folder-outline",
      route: "/addProject",
      type: "project",
    },
    {
      label: "Habits",
      icon: "checkmark-circle-outline",
      route: "/addHabits",
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
              onPress={() => handleActionPress(action)}
            >
              {/* Label */}
              <View className="mr-3 rounded-full bg-black/80 px-4 py-2">
                <Text className="text-white font-medium">{action.label}</Text>
              </View>

              {/* Icon bubble */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 30,
                  backgroundColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name={action.icon as any} size={20} color="black" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity
        onPress={() => setToggle((prev) => !prev)}
        className="w-16 h-16 bg-white/40 border border-black/5 backdrop-blur rounded-full justify-center items-center"
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
          <Ionicons name="add" size={25} color="black" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
