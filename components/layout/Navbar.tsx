import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "Inicio" },
  { href: "#", label: "Sobre Nosotros" },
  { href: "/bookings/mine", label: "Mis Reservas" },
];

export function Navbar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-4">
      <Link href="/" className="flex items-center gap-6">
        <Image
          src="/logo-runaways.svg"
          alt=""
          width={70}
          height={62}
          unoptimized
          className="h-[62px] w-auto"
        />
      </Link>

      <nav aria-label="Principal" className="flex flex-wrap gap-8 md:gap-16">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-zinc-900 hover:text-[#1E4DB7]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/messages" aria-label="Mensajes" className="p-2">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M8 9h8M8 12h5" />
          </svg>
        </Link>

        <button type="button" aria-label="Notificaciones" className="p-2">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M6 10a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
        </button>

        <details className="relative">
          <summary aria-label="Mi cuenta" className="cursor-pointer list-none p-2">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="10" r="3" />
              <path d="M6.5 18a6.5 6.5 0 0 1 11 0" />
            </svg>
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-md">
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-100"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}