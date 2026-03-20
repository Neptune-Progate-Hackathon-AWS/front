"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AuthTokens } from "@/gen/models";
import { getStoredAuth, setStoredAuth, clearStoredAuth } from "./auth-tokens";
import {
  refreshToken as refreshTokenApi,
  logout as logoutApi,
} from "@/gen/api/auth/auth";

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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  function scheduleRefresh(t: AuthTokens, issuedAt: number) {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const expiresAtMs = issuedAt + t.expiresIn * 1000;
    const refreshAtMs = issuedAt + (t.expiresIn * 1000) / 2;
    const delayMs = Math.max(0, refreshAtMs - Date.now());

    // トークンが既に期限切れの場合は即座にクリア
    if (expiresAtMs <= Date.now()) {
      clearStoredAuth();
      setTokens(null);
      return;
    }

    refreshTimerRef.current = setTimeout(async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const res = await refreshTokenApi({ refreshToken: t.refreshToken });
        if (res.status === 200) {
          setStoredAuth(res.data);
          setTokens(res.data);
          // 新しいトークンで再スケジュール（issuedAt は今）
          scheduleRefresh(res.data, Date.now());
        } else {
          clearStoredAuth();
          setTokens(null);
        }
      } catch {
        clearStoredAuth();
        setTokens(null);
      } finally {
        isRefreshingRef.current = false;
      }
    }, delayMs);
  }

  // 初回マウント時に localStorage からトークンを復元
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setTokens(stored.tokens);
      scheduleRefresh(stored.tokens, stored.issuedAt);
    }
    setIsLoading(false);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((newTokens: AuthTokens) => {
    setStoredAuth(newTokens);
    setTokens(newTokens);
    scheduleRefresh(newTokens, Date.now());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(async () => {
    // サーバー側で refresh token を無効化（失敗してもローカルはクリア）
    try {
      const stored = getStoredAuth();
      if (stored) {
        await logoutApi({
          headers: {
            Authorization: `Bearer ${stored.tokens.accessToken}`,
          },
        });
      }
    } catch {
      // サーバー側ログアウト失敗は無視
    }

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    clearStoredAuth();
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
