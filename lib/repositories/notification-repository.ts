export type NotificationStatus = "UNREAD" | "READ";

export type NotificationCategory =
  | "MESSAGING"
  | "BOOKING"
  | "PAYMENT"
  | "VERIFICATION";

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: "TENANT" | "OWNER" | "ADMIN";
  title: string;
  category: NotificationCategory;
  message: string;
  createdAt: string;
  status: NotificationStatus;
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
