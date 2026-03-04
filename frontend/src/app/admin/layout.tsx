"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ProtectedLayout from "@/components/auth/ProtectedLayout";
import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = getAdminTitle(pathname);

  return (
    <ProtectedLayout
      requiredPermission="user_create"
      forbiddenRedirectTo="/forbidden"
    >
      {({ user, isLoggingOut, logout }) => (
        <main className="min-h-screen bg-muted/20 p-4 md:p-6">
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <WorkspaceHeader
              userName={user.profile.name}
              title={title}
              isLoggingOut={isLoggingOut}
              onLogout={logout}
              actions={
                <Button asChild variant="secondary">
                  <Link href="/boards">Boards</Link>
                </Button>
              }
            />
            {children}
          </section>
        </main>
      )}
    </ProtectedLayout>
  );
}

function getAdminTitle(pathname: string) {
  if (pathname === "/admin/users") return "Users Management";
  return "Admin";
}
