"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { enableMocking } from "@/mocks";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { configureAmplify } from "@/lib/amplify-config";

// Amplify の初期化（モジュール読み込み時に1回だけ実行）
configureAmplify();

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mockReady, setMockReady] = useState(false);

  useEffect(() => {
    enableMocking().then(() => setMockReady(true));
  }, []);

  if (!mockReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider position="top-center">{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
