/**
 * 新規登録の submit 処理
 *
 * Cognito signUp を呼び、成功 → /confirm へリダイレクト。
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";

export function useRegisterSubmit() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = useState("");

  async function onSubmit(values: { nickname: string; email: string; password: string }) {
    setServerError("");

    try {
      await register(values.email, values.password, values.nickname);
      toast({
        title: "確認コードを送信しました",
        description: "メールを確認してください",
        variant: "info",
      });
      router.push(`/confirm?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  }

  return { onSubmit, serverError };
}
