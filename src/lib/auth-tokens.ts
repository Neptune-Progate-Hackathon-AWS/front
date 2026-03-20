/**
 * JWT トークンの永続化ユーティリティ
 *
 * localStorage に以下の2つを保存する:
 * - auth_tokens: AuthTokens (accessToken, refreshToken, idToken, expiresIn)
 * - auth_issued_at: トークン発行時刻 (Unix ms)
 *
 * expiresIn はサーバーが返す「有効期限までの秒数」であり、
 * 保存時点からの相対値なので、issuedAt と組み合わせて
 * 絶対的な有効期限を算出する。
 */
import type { AuthTokens } from "@/gen/models";

const STORAGE_KEY = "auth_tokens";
const ISSUED_AT_KEY = "auth_issued_at";

export type StoredAuth = {
  tokens: AuthTokens;
  /** トークンを保存した時刻 (Date.now() の値) */
  issuedAt: number;
};

/** localStorage から取り出した値が AuthTokens の形をしているかチェック */
function isValidTokens(obj: unknown): obj is AuthTokens {
  if (typeof obj !== "object" || obj === null) return false;
  const t = obj as Record<string, unknown>;
  return (
    typeof t.accessToken === "string" &&
    typeof t.refreshToken === "string" &&
    typeof t.idToken === "string" &&
    typeof t.expiresIn === "number"
  );
}

/** localStorage からトークン + 発行時刻を復元する。不正な値の場合は null */
export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  const issuedAtRaw = localStorage.getItem(ISSUED_AT_KEY);
  if (!raw || !issuedAtRaw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!isValidTokens(parsed)) return null;
    return { tokens: parsed, issuedAt: Number(issuedAtRaw) };
  } catch {
    return null;
  }
}

/** トークンを localStorage に保存する。発行時刻は現在時刻を使用 */
export function setStoredAuth(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  localStorage.setItem(ISSUED_AT_KEY, String(Date.now()));
}

/** localStorage からトークン関連データをすべて削除する */
export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ISSUED_AT_KEY);
}
