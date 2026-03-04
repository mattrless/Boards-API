import type { UserResponseDto } from "@/lib/api/generated/boardsAPI.schemas";

export function hasPermission(
  user: UserResponseDto | undefined,
  permission: string,
) {
  return user?.permissions?.includes(permission) ?? false;
}
