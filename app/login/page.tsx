import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Runaways",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Iniciar sesión"
      description="Ingresa tus datos para continuar"
      footer={<>¿No tienes cuenta? <Link href="/register">Regístrate</Link></>}
    >
      <LoginForm />
    </AuthCard>
  );
}
