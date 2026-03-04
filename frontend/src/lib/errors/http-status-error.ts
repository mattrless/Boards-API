export class HttpStatusError extends Error {
  constructor(
    public readonly status: number,
    message = `HTTP ${status}`,
  ) {
    super(message);
    this.name = "HttpStatusError";
  }
}

export function isHttpStatusError(error: unknown): error is HttpStatusError {
  return error instanceof HttpStatusError;
}
