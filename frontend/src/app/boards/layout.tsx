"use client";

import { usePathname } from "next/navigation";

import BoardsWorkspaceLayoutShell from "@/components/layout/BoardsWorkspaceLayoutShell";
import { Crumb } from "@/lib/types/Crumb";

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBoardDetailsRoute = /^\/boards\/[^/]+$/.test(pathname);

  if (isBoardDetailsRoute) {
    return <>{children}</>;
  }

  const crumbs: Crumb[] = [{ title: "Boards" }];

  return (
    <BoardsWorkspaceLayoutShell requiredPermission="board_read" crumbs={crumbs}>
      {children}
    </BoardsWorkspaceLayoutShell>
  );
}
