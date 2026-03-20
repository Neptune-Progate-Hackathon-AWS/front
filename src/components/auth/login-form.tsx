/**
 * ログインフォーム
 *
 * Amplify Auth の signIn を呼び出してメール + パスワードでログインする。
 * 成功時は / (地図ページ) にリダイレクト。
 * メール未確認の場合は /confirm に飛ばす。
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.isSignedIn) {
        toast({ title: "ログインしました", variant: "success" });
        router.push("/");
      } else if (
        result.nextStep?.signInStep === "CONFIRM_SIGN_UP"
      ) {
        // メール確認がまだの場合
        router.push(`/confirm?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ログインに失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <h1 className="text-center text-xl font-bold">ログイン</h1>
      <form onSubmit={handleSubmit}>
        <FieldGroup className="space-y-2">
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
              {isSubmitting ? "ログイン中..." : "ログイン"}
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
            アカウントをお持ちでない方は{` `}
            <Link href="/register" className="underline hover:text-primary">
              新規登録
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
