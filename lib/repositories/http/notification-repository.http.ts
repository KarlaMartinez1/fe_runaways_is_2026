import { apiGet, apiPatch } from "@/lib/api/client";
import type {
  GetNotificationsParams,
  NotificationItem,
  NotificationListResult,
  NotificationRepository,
} from "../notification-repository";
import { mockNotificationRepository } from "../mock/notification-repository.mock";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export const httpNotificationRepository: NotificationRepository = {
  async list(params?: GetNotificationsParams): Promise<NotificationListResult> {
    try {
      const query = buildQuery({
        page: params?.page ?? 1,
        limit: params?.pageSize ?? 10,
        status: params?.status,
      });
      const url = query ? `api/v1/notifications?${query}` : "api/v1/notifications";
      const result = await apiGet<NotificationListResult>(url);
      if (result && Array.isArray(result.data)) {
        return result;
      }
      return mockNotificationRepository.list(params);
    } catch {
      // TODO: falta este dato en el backend (GET /api/v1/notifications aún no disponible en el backend)
      return mockNotificationRepository.list(params);
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiGet<{ unreadCount: number }>(
        "api/v1/notifications/unread-count"
      );
      if (typeof res?.unreadCount === "number") {
        return res.unreadCount;
      }
      return mockNotificationRepository.getUnreadCount();
    } catch {
      // TODO: falta este dato en el backend (GET /api/v1/notifications/unread-count aún no disponible)
      return mockNotificationRepository.getUnreadCount();
    }
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    try {
      return await apiPatch<NotificationItem, Record<string, never>>(
        `api/v1/notifications/${id}/read`,
        {}
      );
    } catch {
      return mockNotificationRepository.markAsRead(id);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiPatch<void, Record<string, never>>(
        "api/v1/notifications/read-all",
        {}
      );
    } catch {
      return mockNotificationRepository.markAllAsRead();
    }
  },
};
