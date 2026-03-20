"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthTokens } from "@/gen/models";
import {
  getStoredTokens,
  setStoredTokens,
  clearStoredTokens,
} from "./auth-tokens";
import { refreshToken as refreshTokenApi } from "@/gen/api/auth/auth";

type AuthState = {
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初回マウント時に localStorage からトークンを復元
  useEffect(() => {
    setTokens(getStoredTokens());
    setIsLoading(false);
  }, []);

  // トークンリフレッシュ（有効期限の半分が過ぎたら自動更新）
  useEffect(() => {
    if (!tokens) return;

    const refreshAfterMs = (tokens.expiresIn * 1000) / 2;
    const timer = setTimeout(async () => {
      try {
        const res = await refreshTokenApi({
          refreshToken: tokens.refreshToken,
        });
        if (res.status === 200) {
          setStoredTokens(res.data);
          setTokens(res.data);
        } else {
          clearStoredTokens();
          setTokens(null);
        }
      } catch {
        clearStoredTokens();
        setTokens(null);
      }
    }, refreshAfterMs);

    return () => clearTimeout(timer);
  }, [tokens]);

  const login = useCallback((newTokens: AuthTokens) => {
    setStoredTokens(newTokens);
    setTokens(newTokens);
  }, []);

  const logout = useCallback(() => {
    clearStoredTokens();
    setTokens(null);
  }, []);

  const value = useMemo(
    () => ({
      tokens,
      isAuthenticated: tokens !== null,
      isLoading,
      login,
      logout,
    }),
    [tokens, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
