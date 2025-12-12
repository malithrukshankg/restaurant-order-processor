import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "../types/auth";

type AuthState = { user: AuthUser | null };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null });

  // Restore session on refresh (simple version: read stored user JSON)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("authUser");
    if (token && userStr) {
      try {
        setState({ user: JSON.parse(userStr) as AuthUser });
      } catch {
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  const setSession = (token: string, user: AuthUser) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    setState({ user });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    setState({ user: null });
  };

  const value = useMemo(
    () => ({
      user: state.user,
      isAuthenticated: !!state.user,
      setSession,
      logout,
    }),
    [state.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
