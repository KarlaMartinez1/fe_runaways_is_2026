import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type {
  GetNotificationsParams,
  NotificationItem,
  NotificationListResult,
  NotificationRepository,
} from "@/lib/repositories/notification-repository";
import { notificationFixtures } from "./fixtures/notifications";

// Estado en memoria mutable para simular persistencia y cambios de estado por sesión
let notificationsStore: NotificationItem[] = notificationFixtures.map((item) => ({
  ...item,
}));

async function getEffectiveUser(): Promise<{ id: string; role: string }> {
  try {
    const user = await getCurrentUser();
    if (user) return { id: user.id, role: user.role };
  } catch {
    // Si no hay cookies de sesión en el contexto, usamos el demo
  }

  // Usuario demo por defecto para pruebas locales / bypass sin sesión
  return {
    id: "00000000-0000-4000-8000-000000000001",
    role: "TENANT",
  };
}

function filterByUser(
  items: NotificationItem[],
  userId?: string,
  role?: string
): NotificationItem[] {
  return items.filter((n) => {
    if (userId && n.userId === userId) return true;
    if (role && n.targetRole === role) return true;
    return false;
  });
}

export const mockNotificationRepository: NotificationRepository = {
  async list(params: GetNotificationsParams = {}): Promise<NotificationListResult> {
    const user = await getEffectiveUser();

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);

    let userNotifications = filterByUser(notificationsStore, user.id, user.role);

    if (params.status) {
      userNotifications = userNotifications.filter((n) => n.status === params.status);
    }

    const total = userNotifications.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const data = userNotifications.slice(startIndex, startIndex + pageSize);

    const unreadCount = filterByUser(notificationsStore, user.id, user.role).filter(
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
    const user = await getEffectiveUser();

    return filterByUser(notificationsStore, user.id, user.role).filter(
      (n) => n.status === "UNREAD"
    ).length;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const user = await getEffectiveUser();

    const index = notificationsStore.findIndex(
      (n) =>
        n.id === id &&
        (n.userId === user.id || n.targetRole === user.role)
    );
    if (index === -1) {
      throw new ApiError(404, "NOT_FOUND", `Notification not found: ${id}`);
    }

    const updated: NotificationItem = {
      ...notificationsStore[index],
      status: "READ",
    };
    notificationsStore[index] = updated;

    return updated;
  },

  async markAllAsRead(): Promise<void> {
    const user = await getEffectiveUser();

    notificationsStore = notificationsStore.map((item) => {
      if (item.userId === user.id || item.targetRole === user.role) {
        return {
          ...item,
          status: "READ",
        };
      }
      return item;
    });
  },
};

export function resetMockNotificationsStore(): void {
  notificationsStore = notificationFixtures.map((item) => ({ ...item }));
}
