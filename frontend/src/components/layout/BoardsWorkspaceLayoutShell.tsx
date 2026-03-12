"use client";

import Link from "next/link";

import ProtectedLayout from "@/components/auth/ProtectedLayout";
import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth/permissions";
import type { Crumb } from "@/lib/types/Crumb";

type BoardsWorkspaceLayoutShellProps = {
  children: React.ReactNode;
  crumbs: Crumb[];
  requiredPermission: string;
};

export default function BoardsWorkspaceLayoutShell({
  children,
  crumbs,
  requiredPermission,
}: BoardsWorkspaceLayoutShellProps) {
  return (
    <ProtectedLayout
      requiredPermission={requiredPermission}
      forbiddenRedirectTo="/forbidden"
    >
      {({ user, isLoggingOut, logout }) => (
        <main className="min-h-screen bg-muted/20 p-2 md:p-6">
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <WorkspaceHeader
              userName={user.profile.name}
              crumbs={crumbs}
              isLoggingOut={isLoggingOut}
              onLogout={logout}
              actions={
                <div>
                  {hasPermission(user, "user_create") ? (
                    <Button asChild variant="secondary">
                      <Link href="/admin/users">Users</Link>
                    </Button>
                  ) : null}
                </div>
              }
            />
            {children}
          </section>
        </main>
      )}
    </ProtectedLayout>
  );
}
