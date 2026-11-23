import { ApiError } from "@/lib/api/client";
import type { AuthUser, LoginResult } from "@/lib/api/auth";

// Usuarios de prueba para revisar autenticación sin backend.
type MockUser = AuthUser & { password: string };
type LoginAttempt = { failures: number[]; blockedUntil: number };

const users: MockUser[] = [
  { id: "00000000-0000-4000-8000-000000000001", email: "tenant@runaways.test", password: "Runaways123", role: "TENANT", name: "Arrendatario Demo", isActive: true },
  { id: "00000000-0000-4000-8000-000000000002", email: "owner@runaways.test", password: "Runaways123", role: "OWNER", name: "Arrendador Demo", isActive: true },
  { id: "00000000-0000-4000-8000-000000000003", email: "admin@runaways.test", password: "Runaways123", role: "ADMIN", name: "Administrador Demo", isActive: true },
  { id: "00000000-0000-4000-8000-000000000004", email: "disabled@runaways.test", password: "Runaways123", role: "TENANT", name: "Cuenta Deshabilitada", isActive: false },
];

const WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, LoginAttempt>();
const activeRefreshTokens = new Map<string, string>();

function fail(status: number, code: string, message: string): never {
  throw new ApiError(status, code, message);
}

function validateCredentials(email: string, password: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail(400, "VALIDATION_ERROR", "Ingresa un correo válido.");
  }
  if (
    password.length < 8 || password.length > 72 ||
    !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)
  ) {
    fail(400, "VALIDATION_ERROR", "La contraseña debe tener entre 8 y 72 caracteres e incluir una minúscula, una mayúscula y un número.");
  }
}

function issueTokens(userId: string) {
  const accessToken = `mock-access-${userId}.${crypto.randomUUID()}`;
  const refreshToken = `mock-refresh-${userId}.${crypto.randomUUID()}`;
  activeRefreshTokens.set(refreshToken, userId);
  return { accessToken, refreshToken, expiresIn: 900 };
}

function toPublicUser(user: MockUser): AuthUser {
  return { id: user.id, email: user.email, role: user.role, name: user.name, isActive: user.isActive };
}

export function mockLogin(email: string, password: string): LoginResult {
  validateCredentials(email, password);
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const attempt = loginAttempts.get(normalizedEmail) ?? { failures: [], blockedUntil: 0 };
  attempt.failures = attempt.failures.filter((time) => now - time < WINDOW_MS);
  if (attempt.blockedUntil > now) {
    fail(429, "TOO_MANY_ATTEMPTS", "Demasiados intentos. Intenta nuevamente en 15 minutos.");
  }

  const user = users.find((candidate) => candidate.email === normalizedEmail);
  if (!user || user.password !== password) {
    attempt.failures.push(now);
    if (attempt.failures.length >= 5) attempt.blockedUntil = now + WINDOW_MS;
    loginAttempts.set(normalizedEmail, attempt);
    fail(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos");
  }

  loginAttempts.delete(normalizedEmail);
  if (!user.isActive) fail(403, "ACCOUNT_DISABLED", "Tu cuenta está deshabilitada.");
  return { ...issueTokens(user.id), user: toPublicUser(user) };
}

export function mockRegister(name: string, email: string, password: string): AuthUser {
  validateCredentials(email, password);
  const normalizedName = name.trim();
  if (!normalizedName || normalizedName.length > 100) {
    fail(400, "VALIDATION_ERROR", "El nombre es obligatorio y debe tener máximo 100 caracteres.");
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((candidate) => candidate.email === normalizedEmail)) {
    fail(409, "EMAIL_TAKEN", "Ya existe una cuenta con ese correo electrónico.");
  }
  const user: MockUser = {
    id: crypto.randomUUID(), email: normalizedEmail, password, role: "TENANT",
    name: normalizedName, isActive: true,
  };
  users.push(user);
  return toPublicUser(user);
}

export function mockMe(accessToken: string): AuthUser {
  const id = accessToken.match(/^mock-access-(.+)\./)?.[1];
  const user = users.find((candidate) => candidate.id === id);
  if (!user) fail(401, "INVALID_TOKEN", "Token de acceso inválido o expirado.");
  return toPublicUser(user);
}

export function mockRefresh(refreshToken: string) {
  const userId = activeRefreshTokens.get(refreshToken);
  const user = users.find((candidate) => candidate.id === userId);
  if (!userId || (user && !user.isActive)) fail(401, "INVALID_REFRESH_TOKEN", "Sesión inválida.");
  activeRefreshTokens.delete(refreshToken);
  return issueTokens(userId);
}

export function mockLogout(refreshToken: string) {
  const userId = activeRefreshTokens.get(refreshToken);
  if (!userId) {
    fail(401, "INVALID_REFRESH_TOKEN", "Sesión inválida.");
  }
  activeRefreshTokens.delete(refreshToken);
}
