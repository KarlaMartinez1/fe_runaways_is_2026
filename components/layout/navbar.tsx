'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils/cn";
import { NotificationBell } from "@/components/notifications";
import { useSessionStore } from "@/lib/stores/session-store";

const navLinksByRole = {
  TENANT: [
    { href: "/", label: "Inicio" },
    { href: "/properties", label: "Catálogo" },
    { href: "/bookings/mine", label: "Mis reservas" },
  ],
  OWNER: [
    // { href: "/", label: "Inicio" },
    { href: "/properties/mine", label: "Mis bienes" },
    { href: "/lessor/bookings", label: "Reservas de mis bienes" },
    { href: "/owner/reports", label: "Reportes" },
  ],
  ADMIN: [
    { href: "/admin/verifications", label: "Verificaciones" },
  ],
} as const;

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/properties", label: "Catálogo" },
  { href: "/login", label: "Iniciar sesión" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useSessionStore();
  const links = user ? navLinksByRole[user.role] : publicLinks;

  const isLinkActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  };

  const isProfileActive = pathname.startsWith("/profile");

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 sm:px-10 lg:px-16 py-3.5 md:py-4">
      <Link href="/" className="flex items-center gap-6">
        <Image
          src="/logo-runaways.svg"
          alt="Runaways Logo"
          width={100}
          height={10}
          unoptimized
          className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto"
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
        {(user?.role === "TENANT" || user?.role === "OWNER") && (
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
        )}

        {user?.role !== "ADMIN" && <NotificationBell />}

        {/* Desktop user account dropdown */}
        <details className="relative hidden md:block">
          <summary
            aria-label="Mi cuenta"
            className={cn(
              "cursor-pointer list-none p-1.5 transition-colors",
              isProfileActive ? "text-[#1E4DB7]" : "text-zinc-800 hover:text-[#1E4DB7]"
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="10" r="3" />
              <path d="M6.5 18a6.5 6.5 0 0 1 11 0" />
            </svg>
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-md">
            {user?.role !== "ADMIN" && (
              <Link
                href="/profile"
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  isProfileActive
                    ? "bg-blue-50 font-semibold text-[#1E4DB7]"
                    : "text-zinc-800 hover:bg-zinc-100"
                )}
              >
                Mi perfil
              </Link>
            )}
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
            className={cn(
              "cursor-pointer list-none p-1.5 transition-colors",
              isProfileActive ? "text-[#1E4DB7]" : "text-zinc-800 hover:text-[#1E4DB7]"
            )}
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
            <div className="pt-2 flex flex-col gap-1">
              {user?.role !== "ADMIN" && (
                <Link
                  href="/profile"
                  className={cn(
                    "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isProfileActive
                      ? "bg-blue-50 font-semibold text-[#1E4DB7]"
                      : "text-zinc-800 hover:bg-zinc-100"
                  )}
                >
                  Mi perfil
                </Link>
              )}
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
