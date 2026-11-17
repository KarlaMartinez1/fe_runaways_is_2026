import type { NotificationCategory } from "@/lib/repositories/notification-repository";

export const notificationMessages = {
  title: "Notificaciones",
  unreadCount: (count: number) =>
    count === 1 ? "1 sin leer" : `${count} sin leer`,
  markAllAsRead: "Marcar todas como leídas",
  markAsRead: "Marcar como leída",
  status: {
    UNREAD: "No leída",
    READ: "Leída",
  },
  categories: {
    MESSAGING: "Mensajería",
    BOOKING: "Reservaciones",
    PAYMENT: "Pagos",
    VERIFICATION: "Verificación",
  } satisfies Record<NotificationCategory, string>,
  empty: "No tienes notificaciones",
  emptyDescription:
    "Cuando recibas novedades sobre reservas, pagos o mensajes aparecerán aquí.",
  error: "No se pudieron cargar las notificaciones. Intente de nuevo.",
  retry: "Reintentar",
  forbidden: "No tienes permiso para ver esta página.",
  bellLabel: (count: number) =>
    count > 0 ? `Notificaciones, ${count} no leídas` : "Notificaciones",
  ariaList: "Bandeja de notificaciones",
};
