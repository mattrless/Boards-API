import { io, Socket } from "socket.io-client";

export async function createAuthenticatedSocket(
  apiUrl: string,
): Promise<Socket | null> {
  try {
    const res = await fetch("/api/auth/token");
    if (!res.ok) return null;
    const { token } = (await res.json()) as { token: string | null };
    if (!token) return null;

    return io(apiUrl, {
      transports: ["websocket"],
      auth: { token },
    });
  } catch {
    return null;
  }
}
