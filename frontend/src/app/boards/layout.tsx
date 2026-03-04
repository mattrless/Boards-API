"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import BoardsHeader from "@/components/boards/BoardsHeader";
import { useMeQuery } from "@/hooks/auth/use-me-query";
import { useLogoutMutation } from "@/hooks/auth/use-logout-mutation";
import { AuthApiError } from "@/lib/api/auth.api";

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const logoutMutation = useLogoutMutation();
  const title = getBoardsTitle(pathname);

  useEffect(() => {
    if (meQuery.error instanceof AuthApiError && meQuery.error.status === 401) {
      router.replace("/");
    }
  }, [meQuery.error, router]);

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: ["auth", "me"] });
        router.replace("/");
      },
    });
  }

  if (meQuery.isPending) {
    return <p className="p-6">Checking session...</p>;
  }

  if (meQuery.isError) {
    if (meQuery.error instanceof AuthApiError && meQuery.error.status === 401) {
      return null;
    }

    return <p className="p-6">Could not load your session.</p>;
  }

  const user = meQuery.data;

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-6">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <BoardsHeader
          userName={user.profile.name}
          title={title}
          isLoggingOut={logoutMutation.isPending}
          onLogout={handleLogout}
        />
        {children}
      </section>
    </main>
  );
}

function getBoardsTitle(pathname: string) {
  if (pathname === "/boards") return "My Boards";
  if (pathname.startsWith("/boards/admin")) return "Admin Users";
  if (pathname.startsWith("/boards/")) return "Board Details";
  return "Boards";
}
