/**
 * メール確認コード入力フォーム
 *
 * RHF + Zod でフォーム管理。submit 処理は useConfirmSubmit に切り出し。
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useConfirmSubmit } from "@/hooks/useConfirmForm";

const confirmSchema = z.object({
  code: z
    .string()
    .min(1, "確認コードを入力してください")
    .regex(/^\d{6}$/, "6桁の数字を入力してください"),
});

export function ConfirmForm({
  email,
  className,
  ...props
}: { email: string } & React.ComponentProps<"div">) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(confirmSchema),
    defaultValues: { code: "" },
  });
  const { onSubmit, serverError } = useConfirmSubmit(email);

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-2">
          <Field>
            <FieldLabel htmlFor="code">確認コード</FieldLabel>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              variant="underline"
              autoFocus
              {...register("code")}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </Field>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
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
