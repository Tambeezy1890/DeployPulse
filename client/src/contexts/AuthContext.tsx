import type { ReactNode } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      toast.success("Login successful");

      console.log(response.data);
    } catch (error) {
      toast.error("Invalid email or password");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: null,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
