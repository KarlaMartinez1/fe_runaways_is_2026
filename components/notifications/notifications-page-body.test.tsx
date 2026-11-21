import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationsPageBody } from "./notifications-page-body";
import { notificationMessages } from "@/lib/messages/notifications";
import {
  fetchNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/app/actions/notifications";
import type { NotificationListResult } from "@/lib/repositories/notification-repository";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

jest.mock("@/app/actions/notifications", () => ({
  fetchNotificationsAction: jest.fn(),
  markNotificationAsReadAction: jest.fn(),
  markAllNotificationsAsReadAction: jest.fn(),
}));

const mockedFetchNotifications =
  fetchNotificationsAction as jest.MockedFunction<
    typeof fetchNotificationsAction
  >;
const mockedMarkAsRead = markNotificationAsReadAction as jest.MockedFunction<
  typeof markNotificationAsReadAction
>;
const mockedMarkAllAsRead =
  markAllNotificationsAsReadAction as jest.MockedFunction<
    typeof markAllNotificationsAsReadAction
  >;

const sampleInitialData: NotificationListResult = {
  data: [
    {
      id: "n-1",
      title: "Pago confirmado",
      category: "PAYMENT",
      message: "Tu pago fue procesado.",
      createdAt: "2026-11-15T10:00:00Z",
      status: "UNREAD",
    },
    {
      id: "n-2",
      title: "Reserva creada",
      category: "BOOKING",
      message: "Tienes una nueva reserva.",
      createdAt: "2026-11-14T09:00:00Z",
      status: "UNREAD",
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  unreadCount: 2,
};

describe("NotificationsPageBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchNotifications.mockResolvedValue(sampleInitialData);
    mockedMarkAsRead.mockResolvedValue({
      ...sampleInitialData.data[0],
      status: "READ",
    });
    mockedMarkAllAsRead.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renderiza la bandeja con contador de no leídas y paginación", () => {
    render(<NotificationsPageBody initialData={sampleInitialData} />);

    expect(
      screen.getByRole("heading", { level: 1, name: notificationMessages.title })
    ).toBeInTheDocument();
    expect(
      screen.getByText(notificationMessages.unreadCount(2))
    ).toBeInTheDocument();
    expect(
      screen.getByRole("feed", { name: notificationMessages.ariaList })
    ).toBeInTheDocument();
    expect(screen.getByText("Pago confirmado")).toBeInTheDocument();
    expect(screen.getByText("Reserva creada")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay notificaciones y deshabilita marcar todas", () => {
    render(
      <NotificationsPageBody
        initialData={{
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
          unreadCount: 0,
        }}
      />
    );

    expect(screen.getByText(notificationMessages.empty)).toBeInTheDocument();
    expect(
      screen.getByText(notificationMessages.emptyDescription)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: notificationMessages.markAllAsRead })
    ).toBeDisabled();
  });

  it("marca una notificación individual y todas como leídas emitiendo el evento de actualización", async () => {
    const user = userEvent.setup();
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    render(<NotificationsPageBody initialData={sampleInitialData} />);

    const markButtons = screen.getAllByRole("button", {
      name: notificationMessages.markAsRead,
    });
    await user.click(markButtons[0]);

    await waitFor(() => {
      expect(mockedMarkAsRead).toHaveBeenCalledWith("n-1");
    });
    expect(
      screen.getByText(notificationMessages.unreadCount(1))
    ).toBeInTheDocument();
    expect(dispatchSpy).toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: notificationMessages.markAllAsRead })
    );

    await waitFor(() => {
      expect(mockedMarkAllAsRead).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByText(notificationMessages.unreadCount(0))
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: notificationMessages.markAsRead })
    ).not.toBeInTheDocument();
  });

  it("ejecuta router.refresh si falla marcar como leída o marcar todas", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockedMarkAsRead.mockRejectedValueOnce(new Error("Error individual"));
    mockedMarkAllAsRead.mockRejectedValueOnce(new Error("Error masivo"));

    render(<NotificationsPageBody initialData={sampleInitialData} />);

    const markButtons = screen.getAllByRole("button", {
      name: notificationMessages.markAsRead,
    });
    await user.click(markButtons[0]);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    await user.click(
      screen.getByRole("button", { name: notificationMessages.markAllAsRead })
    );

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(2);
    });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("refresca notificaciones en sondeo cada 30s, focus y maneja error en sondeo", async () => {
    jest.useFakeTimers();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const updatedData: NotificationListResult = {
      ...sampleInitialData,
      data: [
        ...sampleInitialData.data,
        {
          id: "n-3",
          title: "Verificación aprobada",
          category: "VERIFICATION",
          message: "Tu identidad fue verificada.",
          createdAt: "2026-11-16T08:00:00Z",
          status: "UNREAD",
        },
      ],
      total: 3,
      totalPages: 2,
      unreadCount: 3,
    };

    mockedFetchNotifications
      .mockResolvedValueOnce(updatedData)
      .mockRejectedValueOnce(new Error("Sondeo fallido"));

    render(<NotificationsPageBody initialData={sampleInitialData} />);

    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(screen.getByText("Verificación aprobada")).toBeInTheDocument();
    });
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();

    await act(async () => {
      fireEvent.focus(window);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
