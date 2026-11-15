import { apiJson } from "@/lib/api/server-client";
import { buildApiUrl } from "@/lib/api/url";
import type { AuthRepository, AuthTokens, AuthUser, LoginResult } from "../auth-repository";

function apiError(status: number, code?: string, message?: unknown) {
  const normalized = Array.isArray(message) ? message.join(", ") : message;
  const error = new Error(typeof normalized === "string" ? normalized : "Authentication request failed") as Error & { status: number; code?: string };
  error.status = status;
  error.code = code;
  return error;
}

export const httpAuthRepository: AuthRepository = {
  async login(email, password) {
    const response = await fetch(buildApiUrl("api/v1/auth/login"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw apiError(response.status, data.code, data.message);
    return data as LoginResult;
  },
  async register(name, email, password) {
    const response = await fetch(buildApiUrl("api/v1/auth/register"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }), cache: "no-store",
    });
    if (response.ok) return;
    const data = await response.json().catch(() => ({}));
    throw apiError(response.status, data.code, data.message);
  },
  me(accessToken) {
    return apiJson<AuthUser>("api/v1/auth/me", { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined });
  },
  async refresh(refreshToken) {
    const response = await fetch(buildApiUrl("api/v1/auth/refresh"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }), cache: "no-store",
    });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw apiError(response.status, data.code, data.message); }
    return response.json() as Promise<AuthTokens>;
  },
  async logout(refreshToken) {
    const response = await fetch(buildApiUrl("api/v1/auth/logout"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }), cache: "no-store",
    });
    if (!response.ok) throw apiError(response.status);
  },
};
