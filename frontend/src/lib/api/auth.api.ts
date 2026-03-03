import type {
  CreateUserDto,
  LoginResponseDto,
  LoginUserDto,
  UserResponseDto,
} from "@/lib/api/generated/boardsAPI.schemas";
import { usersControllerCreate, usersControllerFindMe } from "@/lib/api/generated/users/users";

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

export async function login(data: LoginUserDto): Promise<LoginResponseDto> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  const status = response.status;

  if (status === 200) return (await response.json()) as LoginResponseDto;
  if (response.status === 401)
    throw new AuthApiError("Invalid credentials", 401);
  if (response.status === 400)
    throw new AuthApiError("Invalid request data", 400);

  throw new AuthApiError("Unexpected login error", status);
}

export async function register(data: CreateUserDto): Promise<UserResponseDto> {
  const response = await usersControllerCreate(data, {
    credentials: "include",
  });
  const status = response.status as number;

  if (status === 201) {
    return response.data as UserResponseDto;
  }

  if (status === 409) {
    throw new AuthApiError("Email already in use", 409);
  }

  if (status === 400) {
    throw new AuthApiError("Invalid request data", 400);
  }

  throw new AuthApiError("Unexpected register error", status);
}

export async function getCurrentUser(): Promise<UserResponseDto> {
  const response = await usersControllerFindMe({
    credentials: "include",
  });
  const status = response.status;

  if (status === 200) {
    return response.data as UserResponseDto;
  }

  if (status === 401) {
    throw new AuthApiError("Unauthorized", 401);
  }

  throw new AuthApiError("Unexpected session error", status);
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new AuthApiError("Unexpected logout error", response.status);
  }
}
