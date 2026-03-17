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
  boardActions?: ReactNode;
};

export default function WorkspaceHeader({
  userName,
  crumbs,
  isLoggingOut,
  onLogout,
  actions,
  boardActions,
}: WorkspaceHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {userName}'s Workspace
        </p>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl md:text-2xl lg:text-3xl">
              {crumbs.map((c, index) => {
                const isLast = index === crumbs.length - 1;
                const key = `${c.title}-${c.href ?? "current"}-${index}`;

                return (
                  <Fragment key={key}>
                    <BreadcrumbItem>
                      {c.href && !isLast ? (
                        <BreadcrumbLink
                          href={c.href}
                          className="inline-block max-w-[calc(100vw-5.5rem)] truncate text-muted-foreground transition-colors hover:text-foreground sm:max-w-[18rem] md:max-w-88"
                          title={c.title}
                        >
                          {c.title}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage
                          className="inline-block max-w-[calc(100vw-5.5rem)] truncate font-semibold text-foreground sm:max-w-[18rem] md:max-w-88"
                          title={c.title}
                        >
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
          {boardActions ? (
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto **:data-[slot=button]:w-full sm:**:data-[slot=button]:w-auto">
              {boardActions}
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end **:data-[slot=button]:w-full sm:**:data-[slot=button]:w-auto">
          {actions}
          <Button
            variant="outline"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full sm:w-auto"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
