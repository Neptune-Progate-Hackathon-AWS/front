"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { enableMocking } from "@/mocks";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mockReady, setMockReady] = useState(false);

  useEffect(() => {
    enableMocking().then(() => setMockReady(true));
  }, []);

  if (!mockReady) return null;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
