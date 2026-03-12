import type { UserResponseDto } from "@/lib/api/generated/boardsAPI.schemas";

export function hasPermission(
  user: UserResponseDto | undefined,
  permission: string,
) {
  return user?.permissions?.includes(permission) ?? false;
}

export function hasAnyPermission(
  user: UserResponseDto | undefined,
  required: string[],
) {
  return required.some((p) => user?.permissions?.includes(p));
}
