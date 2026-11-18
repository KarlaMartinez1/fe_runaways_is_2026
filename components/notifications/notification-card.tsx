import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { formatNotificationDate } from "@/lib/utils/dates";
import { notificationMessages } from "@/lib/messages/notifications";
import type {
  NotificationCategory,
  NotificationItem,
} from "@/lib/repositories/notification-repository";

export interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead?: (id: string) => void;
  isPending?: boolean;
}

const categoryStyles: Record<NotificationCategory, string> = {
  MESSAGING: "bg-[#F3E8FF] text-[#7E22CE]",
  BOOKING: "bg-[#E0E7FF] text-[#4338CA]",
  RESERVATIONS: "bg-[#E0E7FF] text-[#4338CA]",
  PAYMENT: "bg-[#DCFCE7] text-[#15803D]",
  PAYMENTS: "bg-[#DCFCE7] text-[#15803D]",
  VERIFICATION: "bg-[#FEF3C7] text-[#B45309]",
};

export function NotificationCard({
  notification,
  onMarkAsRead,
  isPending = false,
}: NotificationCardProps) {
  const isUnread = notification.status === "UNREAD";
  const formattedDate = formatNotificationDate(notification.createdAt);
  const categoryLabel =
    notificationMessages.categories[notification.category] ??
    notification.category;

  return (
    <article
      aria-labelledby={`notification-title-${notification.id}`}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 md:p-6 rounded-2xl border transition-colors",
        isUnread
          ? "bg-[#F4F8FD] border-[#DCE8F6]"
          : "bg-white border-zinc-200/90"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          {isUnread && (
            <span
              className="w-2 h-2 rounded-full bg-[#1E4DB7] shrink-0"
              aria-hidden="true"
            />
          )}
          <h2
            id={`notification-title-${notification.id}`}
            className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight"
          >
            {notification.title}
          </h2>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-md text-xs font-medium select-none",
              categoryStyles[notification.category] ?? "bg-zinc-100 text-zinc-700"
            )}
          >
            {categoryLabel}
          </span>
        </div>

        <p className="mt-1.5 text-sm sm:text-[15px] text-zinc-700 leading-relaxed break-words">
          {notification.message}
        </p>

        <time
          dateTime={notification.createdAt}
          className="block mt-2 text-xs sm:text-sm text-zinc-500 font-normal"
        >
          {formattedDate}
        </time>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center pt-2 sm:pt-0">
        {isUnread ? (
          <>
            {onMarkAsRead && (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isPending}
                className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notificationMessages.markAsRead}
              </button>
            )}
            <span className="rounded-full bg-[#1E4DB7] px-3.5 py-1 text-xs font-semibold text-white shadow-sm select-none">
              {notificationMessages.status.UNREAD}
            </span>
          </>
        ) : (
          <span className="rounded-lg bg-zinc-100 px-3.5 py-1 text-xs font-medium text-zinc-600 select-none">
            {notificationMessages.status.READ}
          </span>
        )}
      </div>
    </article>
  );
}
