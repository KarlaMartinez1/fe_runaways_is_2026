import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationCard } from "./notification-card";
import { notificationMessages } from "@/lib/messages/notifications";
import { formatNotificationDate } from "@/lib/utils/dates";
import type {
  NotificationCategory,
  NotificationItem,
} from "@/lib/repositories/notification-repository";

const baseNotification: NotificationItem = {
  id: "notif-1",
  title: "Nuevo mensaje recibido",
  category: "MESSAGING",
  message: "El propietario respondió tu consulta sobre el bien.",
  createdAt: "2026-11-15T14:30:00Z",
  status: "UNREAD",
};

describe("NotificationCard", () => {
  it("renderiza notificación no leída con acción para marcar como leída", async () => {
    const user = userEvent.setup();
    const onMarkAsRead = jest.fn();

    render(
      <NotificationCard
        notification={baseNotification}
        onMarkAsRead={onMarkAsRead}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Nuevo mensaje recibido" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("El propietario respondió tu consulta sobre el bien.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatNotificationDate(baseNotification.createdAt))
    ).toBeInTheDocument();
    expect(
      screen.getByText(notificationMessages.categories.MESSAGING)
    ).toBeInTheDocument();
    expect(
      screen.getByText(notificationMessages.status.UNREAD)
    ).toBeInTheDocument();

    const button = screen.getByRole("button", {
      name: notificationMessages.markAsRead,
    });
    await user.click(button);
    expect(onMarkAsRead).toHaveBeenCalledWith("notif-1");
  });

  it("deshabilita el botón cuando isPending es true", () => {
    render(
      <NotificationCard
        notification={baseNotification}
        onMarkAsRead={jest.fn()}
        isPending
      />
    );

    expect(
      screen.getByRole("button", { name: notificationMessages.markAsRead })
    ).toBeDisabled();
  });

  it("renderiza notificación leída sin botón de marcar como leída", () => {
    render(
      <NotificationCard
        notification={{
          ...baseNotification,
          status: "READ",
        }}
        onMarkAsRead={jest.fn()}
      />
    );

    expect(
      screen.getByText(notificationMessages.status.READ)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: notificationMessages.markAsRead })
    ).not.toBeInTheDocument();
  });

  it.each<NotificationCategory>([
    "MESSAGING",
    "BOOKING",
    "RESERVATIONS",
    "PAYMENT",
    "PAYMENTS",
    "VERIFICATION",
  ])("muestra la etiqueta de categoría correcta para %s", (category) => {
    render(
      <NotificationCard
        notification={{
          ...baseNotification,
          category,
        }}
      />
    );

    expect(
      screen.getByText(notificationMessages.categories[category])
    ).toBeInTheDocument();
  });
});
