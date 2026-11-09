import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Registro | Runaways",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Registro"
      description="Ingresa los datos requeridos"
      footer={<>¿Tienes cuenta? <Link href="/login">Inicia sesión</Link></>}
    >
      <RegisterForm />
    </AuthCard>
  );
}
