/** @jest-environment node */
import { mockLogin, mockLogout, mockMe, mockRefresh, mockRegister } from "@/lib/auth/mock-auth";
import { createSession } from "@/lib/session";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));

const credentials = "ValidPass123";
const uniqueEmail = () => `ac-${crypto.randomUUID()}@runaways.test`;

describe("Autenticación y sesiones", () => {
  it("(AC1) registra name, email y password con rol TENANT y no acepta campos adicionales", () => {
    const email = uniqueEmail();
    const user = mockRegister("Persona", email, credentials);
    expect(user).toMatchObject({ name: "Persona", email, role: "TENANT" });
    expect(user).not.toHaveProperty("password");
    // La acción de registro solo envía los tres campos de la historia; role no forma parte de su contrato.
    expect(Object.keys(user).sort()).toEqual(["email", "id", "isActive", "name", "role"].sort());
  });

  it("(AC2) rechaza correos duplicados y contraseñas fuera de la política", () => {
    const email = uniqueEmail();
    mockRegister("Persona", email, credentials);
    expect(() => mockRegister("Otra", email.toUpperCase(), credentials)).toThrow(expect.objectContaining({ status: 409 }));
    for (const password of ["short1A", "a".repeat(72) + "A1", "alllower123", "ALLUPPER123", "NoNumberAa"]) {
      expect(() => mockRegister("Persona", uniqueEmail(), password)).toThrow(expect.objectContaining({ status: 400 }));
    }
  });

  it("(AC3) inicia sesión y guarda los tokens en cookie HttpOnly desde código de servidor", async () => {
    const email = uniqueEmail();
    mockRegister("Persona", email, credentials);
    const result = mockLogin(email, credentials);
    const set = jest.fn();
    (cookies as jest.Mock).mockResolvedValue({ set });
    await createSession(result.accessToken, result.expiresIn, result.refreshToken, result.user.role);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.expiresIn).toBe(900);
    expect(set).toHaveBeenCalledWith("session", expect.any(String), expect.objectContaining({ httpOnly: true }));
  });

  it("(AC4) usa el mismo error para correo o contraseña incorrectos y oculta el estado de cuenta", () => {
    const email = uniqueEmail();
    expect(() => mockLogin(email, credentials)).toThrow(expect.objectContaining({ status: 401, message: "Correo o contraseña incorrectos" }));
    expect(() => mockLogin("disabled@runaways.test", "WrongPass123")).toThrow(expect.objectContaining({ status: 401, message: "Correo o contraseña incorrectos" }));
    expect(() => mockLogin("disabled@runaways.test", "Runaways123")).toThrow(expect.objectContaining({ status: 403 }));
  });

  it("(AC5) bloquea por 15 minutos al quinto intento fallido para el correo normalizado", () => {
    const email = uniqueEmail();
    for (let i = 0; i < 5; i++) expect(() => mockLogin(email.toUpperCase(), "WrongPass123")).toThrow(expect.objectContaining({ status: 401 }));
    expect(() => mockLogin(email, credentials)).toThrow(expect.objectContaining({ status: 429 }));
  });

  it("(AC6) usa accessToken de 15 minutos y rota refreshToken al renovar", () => {
    const email = uniqueEmail();
    mockRegister("Persona", email, credentials);
    const first = mockLogin(email, credentials);
    const renewed = mockRefresh(first.refreshToken);
    expect(first.expiresIn).toBe(15 * 60);
    expect(renewed.expiresIn).toBe(15 * 60);
    expect(renewed.refreshToken).not.toBe(first.refreshToken);
    expect(() => mockRefresh(first.refreshToken)).toThrow(expect.objectContaining({ status: 401 }));
  });

  it("(AC7) responde 401 para sesión inválida y 403 de acceso para un rol sin permiso", async () => {
    expect(() => mockMe("invalid-token")).toThrow(expect.objectContaining({ status: 401 }));
    const request = new NextRequest("http://localhost/properties/example", {
      headers: { cookie: `session=${encodeURIComponent(JSON.stringify({ accessToken: "mock-access", refreshToken: "refresh", expiresIn: 900, role: "OWNER" }))}` },
    });
    const response = await proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/acceso-denegado");
  });

  it("(AC8) cierra sesión enviando únicamente refreshToken", () => {
    const email = uniqueEmail();
    mockRegister("Persona", email, credentials);
    const session = mockLogin(email, credentials);
    expect(mockLogout(session.refreshToken)).toBeUndefined();
    expect(() => mockRefresh(session.refreshToken)).toThrow(expect.objectContaining({ status: 401 }));
  });

  it("(AC9) no crea cuentas ADMIN por registro ni expone contraseña o hash", () => {
    const user = mockRegister("Persona", uniqueEmail(), credentials);
    expect(user.role).toBe("TENANT");
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordHash");
  });
});
