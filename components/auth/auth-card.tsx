import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./auth.module.css";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

function RunawaysBrand() {
  return (
    <div className={styles.brand} aria-label="Runaways">
      <Image
        aria-hidden="true"
        alt=""
        className={styles.logo}
        src="/logo-runaways.svg"
        width={80}
        height={76}
      />
      <span>Runaways</span>
    </div>
  );
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <main className={styles.shell}>
      <RunawaysBrand />
      <section className={styles.card} aria-label={title}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {children}
        <div className={styles.footer}>{footer}</div>
      </section>
    </main>
  );
}
