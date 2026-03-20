import type { AuthTokens } from "@/gen/models";

const STORAGE_KEY = "auth_tokens";
const ISSUED_AT_KEY = "auth_issued_at";

export type StoredAuth = {
  tokens: AuthTokens;
  issuedAt: number;
};

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

export function setStoredAuth(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  localStorage.setItem(ISSUED_AT_KEY, String(Date.now()));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ISSUED_AT_KEY);
}
