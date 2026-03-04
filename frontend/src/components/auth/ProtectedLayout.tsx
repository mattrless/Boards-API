"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useMeQuery } from "@/hooks/auth/use-me-query";
import { useLogoutMutation } from "@/hooks/auth/use-logout-mutation";
import { hasPermission } from "@/lib/auth/permissions";
import type { UserResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import { isHttpStatusError } from "@/lib/errors/http-status-error";

type ProtectedLayoutRenderProps = {
  user: UserResponseDto;
  isLoggingOut: boolean;
  logout: () => void;
};

type ProtectedLayoutProps = {
  children: (props: ProtectedLayoutRenderProps) => React.ReactNode;
  requiredPermission?: string;
  forbiddenRedirectTo?: string;
};

export default function ProtectedLayout({
  children,
  requiredPermission,
  forbiddenRedirectTo = "/boards",
}: ProtectedLayoutProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const logoutMutation = useLogoutMutation();

  const canAccessRequiredResource =
    !requiredPermission || hasPermission(meQuery.data, requiredPermission);

  useEffect(() => {
    if (isHttpStatusError(meQuery.error) && meQuery.error.status === 401) {
      router.replace("/");
    }
  }, [meQuery.error, router]);

  useEffect(() => {
    if (!meQuery.isSuccess) return;
    if (!canAccessRequiredResource) {
      router.replace(forbiddenRedirectTo);
    }
  }, [canAccessRequiredResource, forbiddenRedirectTo, meQuery.isSuccess, router]);

  function logout() {
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
    if (isHttpStatusError(meQuery.error) && meQuery.error.status === 401) {
      return null;
    }

    return <p className="p-6">Could not load your session.</p>;
  }

  if (!canAccessRequiredResource) return null;

  return children({
    user: meQuery.data,
    isLoggingOut: logoutMutation.isPending,
    logout,
  });
}
