"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import styles from "@/components/auth/auth.module.css";
import { PasswordInput } from "@/components/auth/password-input";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          placeholder="tu@correo.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password">
          Contraseña
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>

      <p aria-live="polite" className={styles.error}>
        {state.error}
      </p>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={pending}
      >
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
