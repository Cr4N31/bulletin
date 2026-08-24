import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Ionicons } from "@react-native-vector-icons/ionicons";

export default function meeting() {
  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]}>
      <View className="h-screen">
        <View className="flex p-8 flex-row justify-between items-center">
          <Text className="font-bold text-4xl">What are we logging today?</Text>
        </View>
        <View className="flex-1 justify-center items-center mb-20">
          <Ionicons name="add" size={22} color={"#00000041"} />
          <Text className="text-sm text-black/30">
            Nothing scheduled or logged yet
          </Text>
        </View>
        <FloatingActionButton />
      </View>
    </SafeAreaView>
  );
}
