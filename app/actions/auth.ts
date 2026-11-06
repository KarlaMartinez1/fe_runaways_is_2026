"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = {
  error?: string;
  email?: string;
};

export type RegisterState = {
  error?: string;
  name?: string;
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Llama a la API de autenticación. Devuelve el token si las credenciales son
// válidas, o null si la API responde 401/403.
async function authenticate(email: string, password: string) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const res = await fetch(new URL("auth/login", apiUrl.replace(/\/?$/, "/")), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`auth/login respondió ${res.status}`);
  }

  // Ajustar al formato de respuesta real de la API.
  const data = await res.json();
  const token: string | undefined =
    data.token ?? data.accessToken ?? data.access_token;
  if (!token) {
    throw new Error("La respuesta de auth/login no incluye un token.");
  }
  return token;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña.", email };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Ingresa un correo válido.", email };
  }

  let token: string | null;
  try {
    token = await authenticate(email, password);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { error: "No se pudo iniciar sesión. Intenta más tarde.", email };
  }
  if (!token) {
    return { error: "Correo o contraseña incorrectos.", email };
  }

  await createSession(token);
  redirect("/");
}

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Ingresa los datos requeridos.", name, email };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Ingresa un correo válido.", name, email };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres.", name, email };
  }

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return { error: "No se pudo crear la cuenta. Intenta más tarde.", name, email };
  }

  let res: Response;
  try {
    res = await fetch(new URL("auth/register", apiUrl.replace(/\/?$/, "/")), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error al registrar la cuenta:", error);
    return { error: "No se pudo crear la cuenta. Intenta más tarde.", name, email };
  }

  if (res.status === 409) {
    return { error: "Ya existe una cuenta con ese correo electrónico.", name, email };
  }
  if (!res.ok) {
    return { error: "No se pudo crear la cuenta. Intenta más tarde.", name, email };
  }

  const data = await res.json();
  const token: string | undefined =
    data.token ?? data.accessToken ?? data.access_token;
  if (token) {
    await createSession(token);
    redirect("/");
  }
  redirect("/login?registered=true");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
