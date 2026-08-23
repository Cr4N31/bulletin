import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView edges={["top", "bottom"]}>
      <View className="p-8">
        <View>
          <Text className="font-bold text-3xl">Welcome Back, User</Text>
        </View>
        <View></View>
      </View>
    </SafeAreaView>
  );
}
