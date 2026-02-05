import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User } from "@/types/user";
import { apiLogin, apiLogout } from "@/services/apiService";

const AUTH_STORAGE_KEY = "datafleet_user";

// Mapeia usuário do Traccar para nosso tipo User
const mapTraccarUserToLocal = (traccarUser: any): User => {
  return {
    id: String(traccarUser.id),
    name: traccarUser.name || traccarUser.email,
    email: traccarUser.email,
    role: traccarUser.administrator ? "super_admin" : "user",
    status: traccarUser.disabled ? "inactive" : "active",
    createdAt: new Date(),
  };
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isApiConnected: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isApiConnected, setIsApiConnected] = useState(false);

  useEffect(() => {
    if (user) setIsApiConnected(true);
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin({ email, password });

      if (response.success && response.user) {
        const newUser = mapTraccarUserToLocal(response.user);

        setUser(newUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        setIsApiConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsApiConnected(false);
    apiLogout();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isApiConnected, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
