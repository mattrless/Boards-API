import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl border bg-card p-6 md:p-8">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Access denied
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            403 Forbidden
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account does not have permission to access this page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/">Return</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
