"use client";

import { useQuery } from "@tanstack/react-query";

import { isHttpStatusError } from "@/lib/errors/http-status-error";
import { usersControllerFindMe } from "@/lib/api/generated/users/users";
import type { UserResponseDto } from "@/lib/api/generated/boardsAPI.schemas";

export function useMeQuery() {
  return useQuery<UserResponseDto>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await usersControllerFindMe({
        credentials: "include",
      });
      if (response.status === 200) {
        return response.data as UserResponseDto;
      }
      throw new Error(`Unexpected session response: ${response.status}`);
    },
    retry: (failureCount, error) =>
      !(isHttpStatusError(error) && error.status === 401) && failureCount < 1,
  });
}
