import { createContext, useContext, useState } from "react";
import { User } from "../types/user";

type AuthContextType = {
  authUser: User | null;
  setAuthUser: React.Dispatch<React.SetStateAction<User | null>>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  return useContext(AuthContext);
};

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [authUser, setAuthUser] = useState<User | null>(JSON.parse(localStorage?.getItem("user") as string) || null);

  return <AuthContext.Provider value={{ authUser, setAuthUser }}>{children}</AuthContext.Provider>;
};
