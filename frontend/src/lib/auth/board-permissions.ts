import { BoardMyPermissionsResponseDto } from "../api/generated/boardsAPI.schemas";

export function hasBoardPermission(
  permissions: string[] | undefined,
  boardPermission: string,
) {
  return permissions?.includes(boardPermission) ?? false;
}

export function hasAllBoardPermissions(
  permissions: string[] | undefined,
  required: string[],
) {
  return required.every((p) => permissions?.includes(p));
}

export function hasAnyBoardPermission(
  permissions: string[] | undefined,
  required: string[],
) {
  return required.some((p) => permissions?.includes(p));
}
