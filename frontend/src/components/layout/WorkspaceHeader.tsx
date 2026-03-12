"use client";

import { Fragment, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Crumb } from "@/lib/types/Crumb";

type WorkspaceHeaderProps = {
  userName: string;
  crumbs: Crumb[];
  isLoggingOut: boolean;
  onLogout: () => void;
  actions?: ReactNode;
};

export default function WorkspaceHeader({
  userName,
  crumbs,
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

        <Breadcrumb>
          <BreadcrumbList className="text-xl font-semibold tracking-tight text-foreground md:text-2xl lg:text-3xl">
            {crumbs.map((c, index) => {
              const isLast = index === crumbs.length - 1;
              const key = `${c.title}-${c.href ?? "current"}-${index}`;

              return (
                <Fragment key={key}>
                  <BreadcrumbItem>
                    {c.href && !isLast ? (
                      <BreadcrumbLink
                        href={c.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {c.title}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-semibold text-foreground">
                        {c.title}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? (
                    <BreadcrumbSeparator className="text-muted-foreground/60" />
                  ) : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
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
