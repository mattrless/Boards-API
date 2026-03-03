import AuthForm from "@/components/auth/AuthForm";
import { LayoutDashboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <Card className="w-full">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <CardTitle className="text-4xl font-bold tracking-tight">
              Boards
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Manage your boards and collaborate with your team in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
