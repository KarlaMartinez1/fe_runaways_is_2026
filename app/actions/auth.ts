"use server";

import { redirect } from "next/navigation";
import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { createSession, deleteSession, getRefreshToken } from "@/lib/session";

export type LoginState = { error?: string; email?: string };
export type RegisterState = { error?: string; name?: string; email?: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Ingresa tu correo y contraseña.", email };
  if (!EMAIL_REGEX.test(email)) return { error: "Ingresa un correo válido.", email };

  try {
    const result = await loginRequest(email, password);
    await createSession(result.accessToken, result.expiresIn, result.refreshToken, result.user.role);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) return { error: "Correo o contraseña incorrectos.", email };
      if (error.status === 403) return { error: "Tu cuenta está deshabilitada.", email };
      if (error.status === 429) {
        return { error: "Demasiados intentos. Intenta nuevamente en 15 minutos.", email };
      }
    }
    console.error("Error de login:", error instanceof ApiError ? error.status : "sin respuesta");
    return { error: "No se pudo iniciar sesión. Intenta más tarde.", email };
  }

  // redirect lanza una excepción interna de Next, por eso va fuera del try.
  redirect("/");
}

export async function register(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || name.length > 100) {
    return { error: "El nombre es obligatorio y debe tener máximo 100 caracteres.", name, email };
  }
  if (!EMAIL_REGEX.test(email)) return { error: "Ingresa un correo válido.", name, email };
  if (
    password.length < 8 ||
    password.length > 72 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return {
      error: "La contraseña debe tener entre 8 y 72 caracteres e incluir una minúscula, una mayúscula y un número.",
      name,
      email,
    };
  }

  try {
    await registerRequest(name, email, password);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return { error: "Ya existe una cuenta con ese correo electrónico.", name, email };
      }
      if (error.status === 400 && error.message) return { error: error.message, name, email };
    }
    console.error("Error de registro:", error instanceof ApiError ? error.status : "sin respuesta");
    return { error: "No se pudo crear la cuenta. Intenta más tarde.", name, email };
  }

  // El registro no crea sesión: el usuario inicia sesión después.
  redirect("/login?registered=true");
}

export async function logout() {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) await logoutRequest(refreshToken);
  } catch (error) {
    console.error("Error al cerrar sesión en la API:", error instanceof ApiError ? error.status : "sin respuesta");
  } finally {
    await deleteSession();
  }
  redirect("/login");
}
