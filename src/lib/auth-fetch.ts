import { getStoredAuth } from "./auth-tokens";

export function authFetchOptions(): RequestInit {
  const stored = getStoredAuth();
  if (!stored) return {};
  return {
    headers: {
      Authorization: `Bearer ${stored.tokens.accessToken}`,
    },
  };
}
