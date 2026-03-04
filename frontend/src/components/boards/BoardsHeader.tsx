"use client";

import { Button } from "@/components/ui/button";

type BoardsHeaderProps = {
  userName: string;
  title: string;
  isLoggingOut: boolean;
  onLogout: () => void;
};

export default function BoardsHeader({
  userName,
  title,
  isLoggingOut,
  onLogout,
}: BoardsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {userName}'s Workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <Button variant="outline" onClick={onLogout} disabled={isLoggingOut}>
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
