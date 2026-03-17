"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getAuthApiErrorMessage } from "@/lib/errors/api-error";
import { useLoginMutation } from "@/hooks/auth/use-login-mutation";
import loginSchema, { type LoginSchema } from "@/lib/schemas/auth/login.schema";

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useLoginMutation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginSchema) {
    loginMutation.mutate(data, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: ["auth", "me"] });
        toast.success("Welcome back!");
        router.push("/boards");
      },
    });
  }

  function onGuestLogin() {
    const password = process.env.NEXT_PUBLIC_GUEST_PASSWORD!;
    const email = process.env.NEXT_PUBLIC_GUEST_EMAIL!;

    const data: LoginSchema = {
      email,
      password,
    };

    loginMutation.mutate(data, {
      onSuccess: () => {
        loginMutation.mutate(
          {
            email: data.email,
            password: data.password,
          },
          {
            onSuccess: () => {
              queryClient.removeQueries({ queryKey: ["auth", "me"] });
              toast.success("Welcome!");
              router.push("/boards");
            },
          },
        );
      },
    });
  }

  return (
    <form
      id="login-form"
      className="w-full"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            form="login-form"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            className="w-full"
            disabled={loginMutation.isPending}
            variant={"outline"}
            onClick={onGuestLogin}
          >
            {loginMutation.isPending ? "Logging in..." : "Enter as a guest"}
          </Button>
          {loginMutation.isError && (
            <FieldError>
              {getAuthApiErrorMessage(loginMutation.error)}
            </FieldError>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
