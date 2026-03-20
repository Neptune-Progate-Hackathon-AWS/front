/**
 * 認証状態を管理する React Context (Amplify Auth 版)
 *
 * 提供するもの:
 * - isAuthenticated: ログイン済みかどうか
 * - isLoading: 初回のセッション確認が完了するまで true
 * - user: 現在ログイン中のユーザー情報 (userId, email)
 * - login(email, password): Cognito にログイン
 * - logout(): サインアウトしてセッションをクリア
 *
 * トークン管理:
 *   Amplify SDK が自動で accessToken / idToken / refreshToken を管理する。
 *   手動での localStorage 操作やリフレッシュスケジューリングは不要。
 *   API 呼び出し時は fetchAuthSession() でトークンを取得する。
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  type SignInOutput,
  type SignUpOutput,
} from "aws-amplify/auth";

type User = {
  userId: string;
  email: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SignInOutput>;
  register: (
    email: string,
    password: string,
    nickname: string,
  ) => Promise<SignUpOutput>;
  confirmRegistration: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  /** API 呼び出し用に accessToken を取得する */
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初回マウント: Amplify のセッションからログイン状態を復元する。
   * Amplify SDK が内部で localStorage / cookie からトークンを読み、
   * 有効なセッションがあれば getCurrentUser() がユーザー情報を返す。
   */
  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId ?? "",
      });
    } catch {
      // 未ログイン状態（エラーではなく正常系）
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn({ username: email, password });

    // サインイン完了後にユーザー情報をセット
    if (result.isSignedIn) {
      await checkCurrentUser();
    }

    return result;
  }, []);

  const register = useCallback(
    async (email: string, password: string, nickname: string) => {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            nickname,
          },
        },
      });
      return result;
    },
    [],
  );

  /** メール確認コードの検証。成功したら自動でログインはしない（ログイン画面に誘導） */
  const confirmRegistration = useCallback(
    async (email: string, code: string) => {
      await confirmSignUp({ username: email, confirmationCode: code });
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  /**
   * API 呼び出し時に Authorization ヘッダーに付与する accessToken を取得する。
   * Amplify が自動的にトークンリフレッシュを行うため、常に有効なトークンが返る。
   */
  const getAccessToken = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() ?? null;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      confirmRegistration,
      logout,
      getAccessToken,
    }),
    [user, isLoading, login, register, confirmRegistration, logout, getAccessToken],
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
