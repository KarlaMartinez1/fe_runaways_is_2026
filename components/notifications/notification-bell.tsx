"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { notificationMessages } from "@/lib/messages/notifications";
import { getUnreadNotificationsCountAction } from "@/app/actions/notifications";

export interface NotificationBellProps {
  initialCount?: number;
  className?: string;
}

export function NotificationBell({
  initialCount = 2,
  className,
}: NotificationBellProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = React.useState<number>(initialCount);
  const isNotificationsActive = pathname.startsWith("/notifications");

  React.useEffect(() => {
    let isCancelled = false;

    const fetchCount = () => {
      void getUnreadNotificationsCountAction()
        .then((count) => {
          if (!isCancelled) {
            setUnreadCount(count);
          }
        })
        .catch(() => {
          // Ignorar fallos de red en sondeo secundario
        });
    };

    // 1. Consulta inicial al cambiar de ruta
    fetchCount();

    // 2. Sondeo cada 30 segundos
    const interval = setInterval(fetchCount, 30000);

    // 3. Actualización al enfocar la pestaña
    const handleFocus = () => {
      fetchCount();
    };
    window.addEventListener("focus", handleFocus);

    // 4. Actualización por evento personalizado
    const handleUpdate = () => {
      fetchCount();
    };
    window.addEventListener("notifications-updated", handleUpdate);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("notifications-updated", handleUpdate);
    };
  }, [pathname]);

  return (
    <Link
      href="/notifications"
      aria-label={notificationMessages.bellLabel(unreadCount)}
      className={cn(
        "relative p-1.5 transition-colors cursor-pointer select-none",
        isNotificationsActive
          ? "text-[#1E4DB7]"
          : "text-zinc-800 hover:text-[#1E4DB7]",
        className
      )}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M6 10a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>

      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E11D48] px-1 text-[11px] font-bold text-white shadow-xs ring-2 ring-white"
          aria-hidden="true"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
