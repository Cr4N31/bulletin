import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppLanguage } from "@/utils/localization";

const LANGUAGE_KEY = "bulletin_language";

export async function getUserName(): Promise<string> {
  const name = await AsyncStorage.getItem("bulletin_user_name");
  return name ?? "";
}

export async function setUserName(name: string): Promise<void> {
  await AsyncStorage.setItem("bulletin_user_name", name);
}

export async function getLanguage(): Promise<AppLanguage> {
  const language = await AsyncStorage.getItem(LANGUAGE_KEY);
  return language === "es" || language === "fr" ? language : "en";
}

export async function setLanguage(language: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}
