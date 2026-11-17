"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { NotificationCard } from "./notification-card";
import { notificationMessages } from "@/lib/messages/notifications";
import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/app/actions/notifications";
import type {
  NotificationItem,
  NotificationListResult,
} from "@/lib/repositories/notification-repository";

export interface NotificationsPageBodyProps {
  initialData: NotificationListResult;
}

export function NotificationsPageBody({
  initialData,
}: NotificationsPageBodyProps) {
  const router = useRouter();
  const [data, setData] = React.useState<NotificationListResult>(initialData);
  const [prevInitialData, setPrevInitialData] =
    React.useState<NotificationListResult>(initialData);
  const [isPending, startTransition] = React.useTransition();

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setData(initialData);
  }

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      setData((prev) => {
        const itemToUpdate = prev.data.find((n) => n.id === id);
        if (!itemToUpdate || itemToUpdate.status === "READ") return prev;

        return {
          ...prev,
          data: prev.data.map((n) =>
            n.id === id ? { ...n, status: "READ" as const } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        };
      });

      try {
        await markNotificationAsReadAction(id);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("notifications-updated"));
        }
      } catch (error) {
        console.error("Error al marcar como leída:", error);
        router.refresh();
      }
    });
  };

  const handleMarkAllAsRead = () => {
    if (data.unreadCount === 0 || isPending) return;

    startTransition(async () => {
      setData((prev) => ({
        ...prev,
        data: prev.data.map((n) => ({ ...n, status: "READ" as const })),
        unreadCount: 0,
      }));

      try {
        await markAllNotificationsAsReadAction();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("notifications-updated"));
        }
      } catch (error) {
        console.error("Error al marcar todas como leídas:", error);
        router.refresh();
      }
    });
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            {notificationMessages.title}
          </h1>
          <span className="text-sm sm:text-base text-zinc-500 font-normal">
            {notificationMessages.unreadCount(data.unreadCount)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={data.unreadCount === 0 || isPending}
          className="self-start sm:self-auto rounded-lg bg-[#F0F5FA] hover:bg-[#E4EDF7] active:bg-[#D9E5F2] text-zinc-700 font-medium px-4 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          {notificationMessages.markAllAsRead}
        </button>
      </div>

      {/* Lista de notificaciones */}
      {data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M6 10a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-800">
            {notificationMessages.empty}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm">
            {notificationMessages.emptyDescription}
          </p>
        </div>
      ) : (
        <div
          role="feed"
          aria-label={notificationMessages.ariaList}
          className="flex flex-col gap-3.5 sm:gap-4"
        >
          {data.data.map((item: NotificationItem) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onMarkAsRead={handleMarkAsRead}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            basePath="/notifications"
          />
        </div>
      )}
      {data.totalPages <= 1 && data.data.length > 0 && (
        <div className="pt-2">
          <Pagination
            currentPage={1}
            totalPages={1}
            basePath="/notifications"
          />
        </div>
      )}
    </section>
  );
}
