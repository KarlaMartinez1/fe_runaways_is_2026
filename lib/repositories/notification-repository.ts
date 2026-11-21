export type NotificationStatus = "UNREAD" | "READ";

export type NotificationCategory =
  | "MESSAGING"
  | "BOOKING"
  | "RESERVATIONS"
  | "PAYMENT"
  | "PAYMENTS"
  | "VERIFICATION";

export interface NotificationItem {
  id: string;
  userId?: string;
  recipientId?: string;
  targetRole?: "TENANT" | "OWNER" | "ADMIN";
  title: string;
  category: NotificationCategory;
  originModule?: string;
  eventType?: string;
  message: string;
  createdAt: string;
  status: NotificationStatus;
  referenceId?: string | null;
  link?: string;
}

export interface NotificationListResult {
  data: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
}

export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  status?: NotificationStatus;
}

export interface NotificationRepository {
  list(params?: GetNotificationsParams): Promise<NotificationListResult>;
  getUnreadCount(): Promise<number>;
  markAsRead(id: string): Promise<NotificationItem>;
  markAllAsRead(): Promise<void>;
}
