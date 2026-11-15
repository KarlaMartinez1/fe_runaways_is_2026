import type { Role } from "@/lib/auth/roles";

export type AuthUser = { id: string; email: string; role: Role; isActive: boolean; name?: string; createdAt?: string };
export type AuthTokens = { accessToken: string; refreshToken: string; expiresIn: number };
export type LoginResult = AuthTokens & { user: AuthUser };

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  register(name: string, email: string, password: string): Promise<void>;
  me(accessToken?: string): Promise<AuthUser>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
}
