/**
 * 認証付き fetch のヘルパー (Amplify Auth 版)
 *
 * Amplify の fetchAuthSession() から accessToken を取得し、
 * Authorization ヘッダーに付与する RequestInit を返す。
 *
 * Amplify SDK がトークンリフレッシュを自動で行うため、
 * 常に有効なトークンが返る。
 *
 * 使い方:
 *   useListToilets({ fetch: await authFetchOptions() })
 *
 * ※ 非同期関数に変更されたことに注意（Amplify のセッション取得が async のため）
 */
import { fetchAuthSession } from "aws-amplify/auth";

export async function authFetchOptions(): Promise<RequestInit> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (!token) return {};
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  } catch {
    return {};
  }
}
