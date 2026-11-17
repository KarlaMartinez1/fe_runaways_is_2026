"use server";

import { notificationRepository } from "@/lib/repositories";
import type {
  GetNotificationsParams,
  NotificationItem,
  NotificationListResult,
} from "@/lib/repositories/notification-repository";

export async function fetchNotificationsAction(
  params?: GetNotificationsParams
): Promise<NotificationListResult> {
  return notificationRepository.list(params);
}

export async function getUnreadNotificationsCountAction(): Promise<number> {
  return notificationRepository.getUnreadCount();
}

export async function markNotificationAsReadAction(
  id: string
): Promise<NotificationItem> {
  return notificationRepository.markAsRead(id);
}

export async function markAllNotificationsAsReadAction(): Promise<void> {
  return notificationRepository.markAllAsRead();
}
