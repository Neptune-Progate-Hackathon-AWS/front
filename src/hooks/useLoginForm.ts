/**
 * ログインの submit 処理
 *
 * Cognito signIn を呼び、成功 → / 、メール未確認 → /confirm へリダイレクト。
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";

export function useLoginSubmit() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = useState("");

  async function onSubmit(values: { email: string; password: string }) {
    setServerError("");

    try {
      const result = await login(values.email, values.password);

      if (result.isSignedIn) {
        toast({ title: "ログインしました", variant: "success" });
        router.push("/");
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        router.push(`/confirm?email=${encodeURIComponent(values.email)}`);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "ログインに失敗しました");
    }
  }

  return { onSubmit, serverError };
}
