import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_TOKEN_COOKIE_NAME, getApiBaseUrl } from "@/lib/server/nest-api";

export async function POST(request: Request) {
  const body = await request.json();
  const apiBaseUrl = getApiBaseUrl();

  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : {};

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const token = data?.access_token;
  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { message: "Invalid auth response from API" },
      { status: 502 },
    );
  }

  // Save cookie
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json(data, { status: 200 });
}
