import { ApiError, apiRequest } from "@/lib/api/client";
import { getAccessToken } from "@/lib/session";
import { mockLogin, mockLogout, mockMe, mockRefresh, mockRegister } from "@/lib/auth/mock-auth";

export type Role = "TENANT" | "OWNER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  name?: string;
  isActive?: boolean;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

// Un solo interruptor: con USE_MOCKS=true no se llama al backend.
const mocksEnabled = () => process.env.USE_MOCKS === "true";

export async function login(email: string, password: string): Promise<LoginResult> {
  if (mocksEnabled()) return mockLogin(email, password);
  return apiRequest<LoginResult>("auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  if (mocksEnabled()) return mockRegister(name, email, password);
  return apiRequest<AuthUser>("auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function logout(refreshToken: string): Promise<void> {
  if (mocksEnabled()) return mockLogout(refreshToken);
  return apiRequest<void>("auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  if (mocksEnabled()) return mockRefresh(refreshToken);
  return apiRequest("auth/refresh", { method: "POST", body: { refreshToken } });
}

export async function me(accessToken: string): Promise<AuthUser> {
  if (mocksEnabled()) return mockMe(accessToken);
  return apiRequest<AuthUser>("auth/me", { accessToken });
}

// Para las vistas: devuelve el usuario de la sesión, o null si no hay sesión válida.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await me(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
