/**
 * 認証付き fetch のヘルパー
 *
 * Orval が生成する API フックは fetch オプションを受け取れるので、
 * この関数の戻り値を渡すと Authorization ヘッダーが自動付与される。
 *
 * 使い方:
 *   useListToilets({ fetch: authFetchOptions() })
 */
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
