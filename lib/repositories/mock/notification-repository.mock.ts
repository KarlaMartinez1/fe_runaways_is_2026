import type {
  GetNotificationsParams,
  NotificationItem,
  NotificationListResult,
  NotificationRepository,
} from "@/lib/repositories/notification-repository";
import { notificationFixtures } from "./fixtures/notifications";

let notificationsStore: NotificationItem[] = notificationFixtures.map((item) => ({
  ...item,
}));

export const mockNotificationRepository: NotificationRepository = {
  async list(params: GetNotificationsParams = {}): Promise<NotificationListResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);

    let filtered = [...notificationsStore];
    if (params.status) {
      filtered = filtered.filter((n) => n.status === params.status);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    const unreadCount = notificationsStore.filter(
      (n) => n.status === "UNREAD"
    ).length;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
      unreadCount,
    };
  },

  async getUnreadCount(): Promise<number> {
    return notificationsStore.filter((n) => n.status === "UNREAD").length;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const index = notificationsStore.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error(`Notification not found: ${id}`);
    }

    const updated: NotificationItem = {
      ...notificationsStore[index],
      status: "READ",
    };
    notificationsStore[index] = updated;

    return updated;
  },

  async markAllAsRead(): Promise<void> {
    notificationsStore = notificationsStore.map((item) => ({
      ...item,
      status: "READ",
    }));
  },
};

export function resetMockNotificationsStore(): void {
  notificationsStore = notificationFixtures.map((item) => ({ ...item }));
}
