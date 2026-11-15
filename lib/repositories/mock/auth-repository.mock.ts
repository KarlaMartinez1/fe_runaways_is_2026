import type { AuthRepository, AuthUser } from "../auth-repository";

const users: AuthUser[] = [
  { id: "mock-tenant", email: "tenant@runaways.test", name: "Usuario Arrendatario", role: "TENANT", isActive: true },
  { id: "mock-owner", email: "owner@runaways.test", name: "Usuario Arrendador", role: "OWNER", isActive: true },
  { id: "mock-admin", email: "admin@runaways.test", name: "Usuario Administrador", role: "ADMIN", isActive: true },
];

export const mockAuthRepository: AuthRepository = {
  async login(email, password) {
    const user = users.find((candidate) => candidate.email === email);
    if (!user || password !== "Runaways123") {
      const error = new Error("Correo o contraseña incorrectos.") as Error & { status: number };
      error.status = 401; throw error;
    }
    return { user, accessToken: `mock-access-${user.role}`, refreshToken: `mock-refresh-${user.role}`, expiresIn: 900 };
  },
  async register() {},
  async me(accessToken) {
    const role = accessToken?.match(/mock-access-(TENANT|OWNER|ADMIN)/)?.[1];
    const user = users.find((candidate) => candidate.role === role);
    if (!user) { const error = new Error("Sesión inválida") as Error & { status: number }; error.status = 401; throw error; }
    return user;
  },
  async refresh(refreshToken) {
    const role = refreshToken.match(/mock-refresh-(TENANT|OWNER|ADMIN)/)?.[1];
    if (!role) { const error = new Error("Sesión inválida") as Error & { status: number }; error.status = 401; throw error; }
    return { accessToken: `mock-access-${role}`, refreshToken: `mock-refresh-${role}`, expiresIn: 900 };
  },
  async logout() {},
};
