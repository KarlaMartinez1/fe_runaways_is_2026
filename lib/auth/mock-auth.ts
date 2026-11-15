import { ApiError } from "@/lib/api/client";
import type { AuthUser, LoginResult } from "@/lib/api/auth";

// Usuarios de prueba para ver las pantallas sin backend.
// Solo se usan con USE_MOCKS=true. Se borra al conectar el backend.
type MockUser = AuthUser & { password: string };

// Los usuarios nuevos del registro viven solo en memoria: se pierden al reiniciar `npm run dev`.
const users: MockUser[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "tenant@runaways.test",
    password: "Runaways123",
    role: "TENANT",
    name: "Arrendatario Demo",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "owner@runaways.test",
    password: "Runaways123",
    role: "OWNER",
    name: "Arrendador Demo",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "admin@runaways.test",
    password: "Runaways123",
    role: "ADMIN",
    name: "Administrador Demo",
    isActive: true,
  },
];

// Copia solo los campos públicos. La contraseña nunca sale de este archivo.
function toPublicUser(user: MockUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    isActive: user.isActive,
  };
}

export function mockLogin(email: string, password: string): LoginResult {
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos");
  }
  if (!user.isActive) {
    throw new ApiError(403, "ACCOUNT_DISABLED", "La cuenta está deshabilitada.");
  }
  return {
    accessToken: `mock-access-${user.id}`,
    refreshToken: `mock-refresh-${user.role}`,
    expiresIn: 900,
    user: toPublicUser(user),
  };
}

export function mockRegister(name: string, email: string, password: string): AuthUser {
  const normalized = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new ApiError(409, "EMAIL_TAKEN", "El email ya está registrado.");
  }
  // Igual que el backend: el rol siempre es TENANT y no se acepta del cliente.
  const user: MockUser = {
    id: crypto.randomUUID(),
    email: normalized,
    password,
    role: "TENANT",
    name,
    isActive: true,
  };
  users.push(user);
  return toPublicUser(user);
}

export function mockMe(accessToken: string): AuthUser {
  const id = accessToken.match(/^mock-access-(.+)$/)?.[1];
  const user = users.find((u) => u.id === id);
  if (!user) {
    throw new ApiError(401, "INVALID_TOKEN", "Token de acceso inválido o expirado.");
  }
  return toPublicUser(user);
}