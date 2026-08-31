import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getUserName, setUserName as saveUserName } from "@/utils/userSettings";

type UserContextType = {
  userName: string;
  updateUserName: (name: string) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    getUserName().then(setUserName);
  }, []);

  async function updateUserName(name: string) {
    setUserName(name);
    await saveUserName(name);
  }

  return (
    <UserContext.Provider value={{ userName, updateUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
