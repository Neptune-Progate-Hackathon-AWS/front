/**
 * メール確認の submit 処理
 *
 * Cognito confirmSignUp を呼び、成功 → /login へリダイレクト。
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";

export function useConfirmSubmit(email: string) {
  const router = useRouter();
  const { confirmRegistration } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = useState("");

  async function onSubmit(values: { code: string }) {
    setServerError("");

    try {
      await confirmRegistration(email, values.code);
      toast({
        title: "メール確認が完了しました",
        description: "ログインしてください",
        variant: "success",
      });
      router.push("/login");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "確認に失敗しました");
    }
  }

  return { onSubmit, serverError };
}
