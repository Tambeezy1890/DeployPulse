import { useState, type ReactNode } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(false);
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("Login response:", response.data);
      localStorage.setItem("token", response.data.accessToken);
      toast.success("Login successful");

      console.log(response.data);
    } catch (error) {
      toast.error("Invalid email or password");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: null,
        login,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
