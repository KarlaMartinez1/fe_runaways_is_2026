"use client";

import { useState } from "react";
import styles from "./auth.module.css";

type PasswordInputProps = {
  id: string;
  name: string;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
};

export function PasswordInput({
  id,
  name,
  autoComplete,
  required,
  minLength,
  placeholder,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const label = visible ? "Ocultar contraseña" : "Mostrar contraseña";

  return (
    <div className={styles.passwordInput}>
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
      />
      <button
        aria-label={label}
        aria-pressed={visible}
        className={styles.passwordToggle}
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7" />
            <path d="M9.9 5.3A10.9 10.9 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1.1-1.3 2.4-2.5 3.6M6.2 6.2C3.9 7.6 2.8 9.5 2.5 12c.5 1.2 3.8 7 9.5 7 1 0 2-.2 2.9-.5" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
