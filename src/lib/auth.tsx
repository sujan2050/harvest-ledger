import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { api, clearSession, getStoredUser, storeSession, type AuthUser, type Role } from "./api";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function extractRole(payload: Record<string, unknown>, fallback?: string): Role {
  const raw =
    (payload["role"] as string | undefined) ??
    (Array.isArray(payload["roles"]) ? String((payload["roles"] as string[])[0]) : undefined) ??
    fallback ??
    "FARMER";
  const r = raw.toUpperCase().replace("ROLE_", "");
  if (r.includes("ADMIN")) return "ADMIN";
  if (r.includes("STAFF")) return "STAFF";
  return "FARMER";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api<Record<string, unknown>>("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    const token = String(res["token"] ?? res["accessToken"] ?? res["jwt"] ?? "");
    if (!token) throw new Error("Login response did not include a token.");
    const nextUser: AuthUser = {
      username: String(res["username"] ?? username),
      role: extractRole(res),
      fullName: res["fullName"] ? String(res["fullName"]) : undefined,
      id: (res["id"] as number | undefined) ?? undefined,
    };
    storeSession(token, nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const fallbackAuth: AuthContextValue = {
  user: null,
  ready: false,
  login: async () => {
    throw new Error("Auth is not ready yet.");
  },
  logout: () => {},
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? fallbackAuth;
}

export function homeForRole(role: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "STAFF") return "/staff";
  return "/farmer";
}

export function useRequireRole(roles: Role[]) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      void navigate({ to: "/login", replace: true });
    } else if (!roles.includes(user.role)) {
      void navigate({ to: homeForRole(user.role), replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, navigate]);
  return { user, ready: ready && !!user && roles.includes(user.role) };
}
