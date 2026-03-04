import { HttpStatusError } from "@/lib/errors/http-status-error";

function getHttpErrorMessage(status: number, data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  return `HTTP ${status}`;
}

export async function customFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const basePath = "/api/nest";
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  const targetUrl = `${basePath}${normalizedPath}`;

  const response = await fetch(targetUrl, {
    ...options,
    credentials: options?.credentials ?? "include",
  });

  const bodyText = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  let data: unknown = {};
  if (bodyText) {
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = bodyText;
    }
  }

  if (response.status === 401 || response.status === 403) {
    throw new HttpStatusError(
      response.status,
      getHttpErrorMessage(response.status, data),
    );
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
}
