import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function Index() {
  return (
    <SafeAreaView edges={["top", "bottom"]}>
      <View className="h-screen p-8">
        <View>
          <Text className="font-bold text-3xl">Welcome Back, User</Text>
        </View>
        <View></View>
        <FloatingActionButton />
      </View>
    </SafeAreaView>
  );
}
