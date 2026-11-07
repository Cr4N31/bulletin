import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getLanguage,
  getUserName,
  setLanguage as saveLanguage,
  setUserName as saveUserName,
} from "@/utils/userSettings";
import { AppLanguage } from "@/utils/localization";

type UserContextType = {
  userName: string;
  updateUserName: (name: string) => Promise<void>;
  language: AppLanguage;
  updateLanguage: (language: AppLanguage) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    getUserName().then(setUserName);
    getLanguage().then(setLanguage);
  }, []);

  async function updateUserName(name: string) {
    setUserName(name);
    await saveUserName(name);
  }

  async function updateLanguage(nextLanguage: AppLanguage) {
    setLanguage(nextLanguage);
    await saveLanguage(nextLanguage);
  }

  return (
    <UserContext.Provider
      value={{ userName, updateUserName, language, updateLanguage }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
