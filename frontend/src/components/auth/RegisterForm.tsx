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

import { AuthApiError } from "@/lib/api/auth.api";
import { useRegisterMutation } from "@/hooks/auth/use-register-mutation";
import { useLoginMutation } from "@/hooks/auth/use-login-mutation";
import registerSchema, {
  type RegisterSchema,
} from "@/lib/schemas/auth/register.schema";

function getRegisterErrorMessage(error: unknown) {
  if (error instanceof AuthApiError) return error.message;
  return "Something went wrong. Please try again.";
}

export default function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatar: "",
    },
  });

  function onSubmit(data: RegisterSchema) {
    registerMutation.mutate(data, {
      onSuccess: () => {
        loginMutation.mutate(
          {
            email: data.email,
            password: data.password,
          },
          {
            onSuccess: () => {
              queryClient.removeQueries({ queryKey: ["auth", "me"] });
              router.push("/boards");
            },
          },
        );
      },
    });
  }

  return (
    <form
      id="register-form"
      className="w-full"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="text"
                placeholder="John Doe"
                autoComplete="name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
                placeholder="john.doe@example.com"
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
                placeholder="strongPassword123"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="avatar"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Avatar URL (optional)</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="url"
                placeholder="https://example.com/avatar.jpg"
                autoComplete="url"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          form="register-form"
          disabled={registerMutation.isPending || loginMutation.isPending}
        >
          {registerMutation.isPending || loginMutation.isPending
            ? "Signing you in..."
            : "Create account"}
        </Button>
        {registerMutation.isError && (
          <FieldError>{getRegisterErrorMessage(registerMutation.error)}</FieldError>
        )}
        {loginMutation.isError && (
          <FieldError>
            Account created, but auto-login failed. Please sign in manually.
          </FieldError>
        )}
      </FieldGroup>
    </form>
  );
}
