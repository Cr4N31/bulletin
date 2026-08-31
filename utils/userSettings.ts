import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getUserName(): Promise<string> {
  const name = await AsyncStorage.getItem("bulletin_user_name");
  return name ?? "";
}

export async function setUserName(name: string): Promise<void> {
  await AsyncStorage.setItem("bulletin_user_name", name);
}
