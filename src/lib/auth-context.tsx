/**
 * 認証状態を管理する React Context
 *
 * 提供するもの:
 * - tokens: 現在の JWT トークン (null = 未ログイン)
 * - isAuthenticated: ログイン済みかどうか
 * - isLoading: 初回の localStorage 復元が完了するまで true
 * - login(tokens): トークンを保存してログイン状態にする
 * - logout(): サーバー側ログアウト → ローカルのトークンをクリア
 *
 * トークンの自動リフレッシュ:
 *   有効期限の半分が経過したタイミングで自動的に refreshToken API を呼ぶ。
 *   タブを閉じて再度開いた場合も、保存済みの issuedAt から残り時間を正しく計算する。
 *   期限切れのトークンが見つかった場合は即座にクリアする。
 */
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
  /** リフレッシュ用タイマーの ID。コンポーネント破棄時にクリアする */
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 二重リフレッシュ防止フラグ */
  const isRefreshingRef = useRef(false);

  /**
   * 指定時刻に基づいてトークンリフレッシュをスケジュールする。
   *
   * リフレッシュタイミング = issuedAt + (expiresIn / 2)
   * → 有効期限の折り返し地点で新しいトークンを取得する。
   *
   * ※ useEffect の deps に tokens を入れると setTokens の度に
   *   再トリガーされて無限ループになるため、ref + 明示呼び出しで管理している。
   */
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
          // 新しいトークンで再スケジュール（issuedAt は現在時刻）
          scheduleRefresh(res.data, Date.now());
        } else {
          // リフレッシュ失敗 → セッション切れとして扱う
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

  // 初回マウント: localStorage からトークンを復元し、リフレッシュをスケジュール
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

  /** ログイン成功時にトークンを保存し、リフレッシュタイマーを開始する */
  const login = useCallback((newTokens: AuthTokens) => {
    setStoredAuth(newTokens);
    setTokens(newTokens);
    scheduleRefresh(newTokens, Date.now());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * ログアウト処理
   * 1. サーバー側で refresh token を無効化（Cognito 上のセッション破棄）
   * 2. ローカルのトークンとリフレッシュタイマーをクリア
   * ※ サーバー側の失敗はローカルクリアをブロックしない
   */
  const logout = useCallback(async () => {
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
      // サーバー側ログアウト失敗は無視（ローカルは必ずクリアする）
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

/** 認証状態を取得するフック。AuthProvider の内側でのみ使用可能 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
