import { useCallback, useEffect, useState, type ReactNode } from "react";

import toast from "react-hot-toast";

import { AuthContext } from "./AuthContext";

import authService, { type AuthUser } from "../services/authServices";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [initializing, setInitializing] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const restoredUser = await authService.restoreSession();

        if (active) {
          setUser(restoredUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setInitializing(false);

      // Avoid showing this during a first visit where
      // the user has never logged in.
      if (localStorage.getItem("hadSession")) {
        toast.error("Your session expired. Please log in again.");

        localStorage.removeItem("hadSession");
      }
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);

    try {
      const authenticatedUser = await authService.login(email, password);

      setUser(authenticatedUser);
      localStorage.setItem("hadSession", "true");

      toast.success("Login successful");
    } catch (error) {
      toast.error("Invalid email or password");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("hadSession");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        initializing,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
