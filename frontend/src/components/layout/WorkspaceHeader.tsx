"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type WorkspaceHeaderProps = {
  userName: string;
  title: string;
  isLoggingOut: boolean;
  onLogout: () => void;
  actions?: ReactNode;
};

export default function WorkspaceHeader({
  userName,
  title,
  isLoggingOut,
  onLogout,
  actions,
}: WorkspaceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {userName}'s Workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="outline" onClick={onLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
