/**
 * ログインフォーム
 *
 * RHF + Zod でフォーム管理。submit 処理は useLoginSubmit に切り出し。
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useLoginSubmit } from "@/hooks/useLoginForm";

const loginSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { onSubmit, serverError } = useLoginSubmit();

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <h1 className="text-center text-xl font-bold">ログイン</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-2">
          <Field>
            <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              variant="underline"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="password">パスワード</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              variant="underline"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </Field>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
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
