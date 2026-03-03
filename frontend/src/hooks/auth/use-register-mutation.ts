"use client";

import { useMutation } from "@tanstack/react-query";

import { register } from "@/lib/api/auth.api";
import type { RegisterSchema } from "@/lib/schemas/auth/register.schema";

export function useRegisterMutation() {
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: (data: RegisterSchema) =>
      register({
        email: data.email,
        password: data.password,
        profile: {
          name: data.name,
          ...(data.avatar ? { avatar: data.avatar } : {}),
        },
      }),
  });
}
