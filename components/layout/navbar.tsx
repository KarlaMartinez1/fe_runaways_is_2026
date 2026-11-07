'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "Inicio" },
  { href: "#", label: "Sobre Nosotros" },
  { href: "/bookings/mine", label: "Mis Reservas" },
];

export function Navbar() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/bookings/mine") {
      return pathname.startsWith("/bookings") || pathname.startsWith("/payment");
    }
    return pathname === href;
  };

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 sm:px-10 lg:px-16 py-3.5 md:py-4">
      <Link href="/" className="flex items-center gap-6">
        <Image
          src="/logo-runaways.svg"
          alt="Runaways Logo"
          width={120}
          height={32}
          unoptimized
          className="h-7 sm:h-8 md:h-[30px] w-auto"
        />
      </Link>

      <nav aria-label="Principal" className="hidden md:flex items-center gap-10 lg:gap-14">
        {links.map((link) => {
          const active = isLinkActive(link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                active
                  ? "text-[#1E4DB7] font-semibold"
                  : "text-zinc-600 hover:text-[#1E4DB7] font-medium"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
        <Link
          href="/messages"
          aria-label="Mensajes"
          className="p-1.5 text-zinc-800 hover:text-[#1E4DB7] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M8 9h8M8 12h5" />
          </svg>
        </Link>

        <button
          type="button"
          aria-label="Notificaciones"
          className="p-1.5 text-zinc-800 hover:text-[#1E4DB7] transition-colors cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 10a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
        </button>

        {/* Desktop user account dropdown */}
        <details className="relative hidden md:block">
          <summary
            aria-label="Mi cuenta"
            className="cursor-pointer list-none p-1.5 text-zinc-800 hover:text-[#1E4DB7] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="10" r="3" />
              <path d="M6.5 18a6.5 6.5 0 0 1 11 0" />
            </svg>
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-md">
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-100 text-zinc-800 cursor-pointer"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </details>

        {/* Mobile hamburger menu */}
        <details className="relative md:hidden">
          <summary
            aria-label="Menú principal"
            className="cursor-pointer list-none p-1.5 text-zinc-800 hover:text-[#1E4DB7] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </summary>
          <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
            <div className="flex flex-col gap-1 pb-2 border-b border-zinc-100">
              {links.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "text-[#1E4DB7] font-semibold bg-blue-50/60"
                        : "text-zinc-800 hover:bg-zinc-100 font-medium"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="pt-1">
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}