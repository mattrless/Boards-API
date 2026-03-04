import { AuthApiError } from "@/lib/api/auth.api";

export function getAuthApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof AuthApiError) return error.message;
  return fallback;
}

export function getErrorMessageByStatus(
  status: number,
  messagesByStatus: Record<number, string>,
  fallback = "Something went wrong. Please try again.",
) {
  return messagesByStatus[status] ?? fallback;
}
