"use client";

import { useMutation } from "@tanstack/react-query";

import { AuthApiError } from "@/lib/api/auth.api";
import { usersControllerCreate } from "@/lib/api/generated/users/users";
import type { RegisterSchema } from "@/lib/schemas/auth/register.schema";

export function useRegisterMutation() {
  const defaultAvatar = process.env.NEXT_PUBLIC_DEFAULT_AVATAR;
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (data: RegisterSchema) => {
      const response = await usersControllerCreate(
        {
          email: data.email,
          password: data.password,
          profile: {
            name: data.name,
            ...(data.avatar
              ? { avatar: data.avatar }
              : { avatar: defaultAvatar }),
          },
        },
        {
          credentials: "include",
        },
      );
      const status = response.status as number;

      if (status === 201) {
        return response.data;
      }

      if (status === 409) {
        throw new AuthApiError("Email already in use", 409);
      }

      if (status === 400) {
        throw new AuthApiError("Invalid request data", 400);
      }

      throw new AuthApiError("Unexpected register error", status);
    },
  });
}
