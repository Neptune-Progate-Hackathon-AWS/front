/**
 * メール確認コード入力フォーム
 *
 * 新規登録後に Cognito が送信する6桁の確認コードを入力する画面。
 * 成功時は /login にリダイレクトし、ログインを促す。
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";

export function ConfirmForm({
  email: initialEmail,
  className,
  ...props
}: { email: string } & React.ComponentProps<"div">) {
  const router = useRouter();
  const { confirmRegistration } = useAuth();
  const { toast } = useToast();
  const [email] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await confirmRegistration(email, code);
      toast({ title: "メール確認が完了しました", description: "ログインしてください", variant: "success" });
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("確認に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="text-center">
        <h1 className="text-xl font-bold">メール確認</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium">{email}</span> に送信された
          <br />
          確認コードを入力してください
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <FieldGroup className="space-y-2">
          <Field>
            <FieldLabel htmlFor="code">確認コード</FieldLabel>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              variant="underline"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </Field>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "確認中..." : "確認する"}
            </Button>
          </Field>
          <FieldDescription className="text-center text-sm text-muted-foreground">
            コードが届かない場合は迷惑メールフォルダを確認してください
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
