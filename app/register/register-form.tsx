"use client";

import { useActionState } from "react";
import { register, type RegisterState } from "@/app/actions/auth";
import styles from "@/components/auth/auth.module.css";
import { PasswordInput } from "@/components/auth/password-input";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={120}
          defaultValue={state.name}
          placeholder="Tu nombre completo"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          placeholder="nombre@correo.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <p aria-live="polite" className={styles.error}>
        {state.error}
      </p>

      <button className={styles.submitButton} type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Registrarse"}
      </button>
    </form>
  );
}
