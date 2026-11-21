import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Acceso denegado</h1>
      <p>No tienes permiso para ver esta página</p>
      <Link className="underline" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
