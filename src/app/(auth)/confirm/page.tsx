/**
 * メール確認ページ (/confirm?email=xxx)
 *
 * 新規登録後にリダイレクトされる。
 * クエリパラメータから email を受け取り、ConfirmForm に渡す。
 */
"use client";

import { useSearchParams } from "next/navigation";
import { ConfirmForm } from "@/components/auth/confirm-form";
import { Suspense } from "react";

function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  if (!email) {
    return (
      <p className="text-center text-muted-foreground">
        メールアドレスが指定されていません
      </p>
    );
  }

  return <ConfirmForm email={email} />;
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmPageContent />
    </Suspense>
  );
}
