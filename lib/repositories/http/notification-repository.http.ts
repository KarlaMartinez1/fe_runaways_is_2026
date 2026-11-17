import { apiGet, apiPatch } from "@/lib/api/client";
import type {
  GetNotificationsParams,
  NotificationCategory,
  NotificationItem,
  NotificationListResult,
  NotificationRepository,
} from "../notification-repository";
import { mockNotificationRepository } from "../mock/notification-repository.mock";

export interface BackendNotification {
  id: string;
  recipientId: string;
  eventType: string;
  originModule: string;
  title: string;
  message: string;
  referenceId: string | null;
  status: "UNREAD" | "READ";
  createdAt: string;
  updatedAt: string;
}

export interface BackendNotificationListResponse {
  data: BackendNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function normalizeCategory(originModule?: string, category?: string): NotificationCategory {
  const mod = (originModule || category || "").toUpperCase();
  if (mod === "RESERVATIONS" || mod === "BOOKING") return "BOOKING";
  if (mod === "PAYMENTS" || mod === "PAYMENT") return "PAYMENT";
  if (mod === "MESSAGING") return "MESSAGING";
  if (mod === "VERIFICATION") return "VERIFICATION";
  return "MESSAGING";
}

function resolveNotificationLink(item: BackendNotification): string | undefined {
  const mod = (item.originModule || "").toUpperCase();
  if (mod === "MESSAGING") return "/messages";
  if (mod === "VERIFICATION") return "/profile/verification";
  if (mod === "RESERVATIONS" || mod === "BOOKING" || mod === "PAYMENTS" || mod === "PAYMENT") {
    return "/bookings/mine";
  }
  return undefined;
}

function mapBackendToNotificationItem(item: BackendNotification): NotificationItem {
  return {
    id: item.id,
    userId: item.recipientId,
    recipientId: item.recipientId,
    title: item.title,
    category: normalizeCategory(item.originModule),
    originModule: item.originModule,
    eventType: item.eventType,
    message: item.message,
    createdAt: item.createdAt,
    status: item.status,
    referenceId: item.referenceId,
    link: resolveNotificationLink(item),
  };
}

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
      const page = Math.max(1, params?.page ?? 1);
      const limit = Math.max(1, params?.pageSize ?? 10);

      // El DTO del backend (NotificationQueryDto) únicamente valida `page` y `limit`.
      // Con forbidNonWhitelisted: true, enviar parámetros adicionales lanza un error 400.
      const query = buildQuery({ page, limit });
      const url = query ? `api/v1/notifications?${query}` : "api/v1/notifications";

      const [res, unreadRes] = await Promise.all([
        apiGet<BackendNotificationListResponse>(url),
        apiGet<{ unreadCount: number }>("api/v1/notifications/unread-count").catch(
          () => ({ unreadCount: 0 })
        ),
      ]);

      if (res && Array.isArray(res.data)) {
        return {
          data: res.data.map(mapBackendToNotificationItem),
          total: res.total,
          page: res.page,
          pageSize: res.limit ?? limit,
          totalPages:
            res.totalPages ?? Math.max(1, Math.ceil(res.total / limit)),
          unreadCount: unreadRes?.unreadCount ?? 0,
        };
      }
      return mockNotificationRepository.list(params);
    } catch (error) {
      if (process.env.USE_MOCKS !== "true") {
        throw error;
      }
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
    } catch (error) {
      if (process.env.USE_MOCKS !== "true") {
        throw error;
      }
      return mockNotificationRepository.getUnreadCount();
    }
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    try {
      const res = await apiPatch<BackendNotification, Record<string, never>>(
        `api/v1/notifications/${encodeURIComponent(id)}/read`,
        {}
      );
      return mapBackendToNotificationItem(res);
    } catch (error) {
      if (process.env.USE_MOCKS !== "true") {
        throw error;
      }
      return mockNotificationRepository.markAsRead(id);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiPatch<{ updatedCount: number }, Record<string, never>>(
        "api/v1/notifications/read-all",
        {}
      );
    } catch (error) {
      if (process.env.USE_MOCKS !== "true") {
        throw error;
      }
      return mockNotificationRepository.markAllAsRead();
    }
  },
};
