import { getStoredTokens } from "./auth-tokens";

export function authFetchOptions(): RequestInit {
  const tokens = getStoredTokens();
  if (!tokens) return {};
  return {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  };
}
