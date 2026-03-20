/**
 * 新規登録フォーム
 *
 * Amplify Auth の signUp を呼び出してメール + パスワード + ニックネームで登録。
 * 成功時は /confirm (メール確認コード入力) にリダイレクト。
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(email, password, nickname);
      toast({ title: "確認コードを送信しました", description: "メールを確認してください", variant: "info" });
      router.push(`/confirm?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("登録に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <h1 className="text-center text-xl font-bold">新規登録</h1>
      <form onSubmit={handleSubmit}>
        <FieldGroup className="space-y-2">
          <Field>
            <FieldLabel htmlFor="nickname">ニックネーム</FieldLabel>
            <Input
              id="nickname"
              type="text"
              placeholder="ずんだもん"
              variant="underline"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              variant="underline"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">パスワード</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              variant="underline"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "アカウントを作成"}
            </Button>
          </Field>
          <FieldSeparator>または</FieldSeparator>
          <Field>
            <Button variant="outline" type="button" className="flex gap-2">
              <Image src="/google.svg" alt="Google" width={20} height={20} />
              Googleでログイン
            </Button>
          </Field>
          <FieldDescription className="text-center text-sm">
            アカウントをすでにお持ちの方は{` `}
            <Link href="/login" className="underline hover:text-primary">
              ログイン
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-sm text-center">
        <Link href="/terms" className="underline hover:text-primary">
          利用規約
        </Link>
        {` `}
        <Link href="/privacy" className="underline hover:text-primary">
          プライバシーポリシー
        </Link>
      </FieldDescription>
    </div>
  );
}
