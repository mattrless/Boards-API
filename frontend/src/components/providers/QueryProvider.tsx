"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { isHttpStatusError } from "@/lib/errors/http-status-error";

let isHandlingGlobalAuthError = false;

async function handleGlobalApiError(error: unknown) {
  if (!isHttpStatusError(error)) return;
  if (typeof window === "undefined") return;

  if (error.status === 401) {
    if (isHandlingGlobalAuthError) return;
    isHandlingGlobalAuthError = true;
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      if (window.location.pathname !== "/") {
        window.location.replace("/");
        return;
      }
      isHandlingGlobalAuthError = false;
    }
    return;
  }

  if (error.status === 403 && window.location.pathname !== "/forbidden") {
    window.location.replace("/forbidden");
  }
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            void handleGlobalApiError(error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            void handleGlobalApiError(error);
          },
        }),
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
