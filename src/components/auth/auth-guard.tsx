/**
 * 認証ガードコンポーネント
 *
 * 保護したいページをこのコンポーネントで囲むと、
 * 未ログイン時に /login へリダイレクトする。
 *
 * 使い方:
 *   <AuthGuard>
 *     <ProtectedPageContent />
 *   </AuthGuard>
 */
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // ローディング完了後、未ログインならログインページへ飛ばす
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // localStorage からの復元中はローディング表示
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  // リダイレクト待ち（useEffect 内で /login に飛ぶ）
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
