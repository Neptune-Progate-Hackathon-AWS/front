/**
 * 新規登録フォーム
 *
 * RHF + Zod でフォーム管理。submit 処理は useRegisterSubmit に切り出し。
 */
"use client";

import { useForm, type Resolver } from "react-hook-form";
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
import { useRegisterSubmit } from "@/hooks/useRegisterForm";

const registerSchema = z.object({
  nickname: z.string().min(1, "ニックネームを入力してください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(/[a-z]/, "小文字を含めてください")
    .regex(/[A-Z]/, "大文字を含めてください")
    .regex(/[0-9]/, "数字を含めてください"),
});

type RegisterValues = z.infer<typeof registerSchema>;

// react-hook-form v7 + zod v3 の型互換性問題を回避
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registerResolver = zodResolver(registerSchema as any) as any;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: registerResolver,
    defaultValues: { nickname: "", email: "", password: "" },
  });
  const { onSubmit, serverError } = useRegisterSubmit();

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <h1 className="text-center text-xl font-bold">新規登録</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-2">
          <Field>
            <FieldLabel htmlFor="nickname">ニックネーム</FieldLabel>
            <Input
              id="nickname"
              type="text"
              placeholder="ずんだもん"
              variant="underline"
              {...register("nickname")}
            />
            {errors.nickname && (
              <p className="text-sm text-destructive">{errors.nickname.message}</p>
            )}
          </Field>
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
