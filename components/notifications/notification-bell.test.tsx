import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationBell } from "./notification-bell";
import { notificationMessages } from "@/lib/messages/notifications";
import { getUnreadNotificationsCountAction } from "@/app/actions/notifications";

const mockUsePathname = jest.fn(() => "/properties");

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("@/app/actions/notifications", () => ({
  getUnreadNotificationsCountAction: jest.fn(),
}));

const mockedGetUnreadCount =
  getUnreadNotificationsCountAction as jest.MockedFunction<
    typeof getUnreadNotificationsCountAction
  >;

describe("NotificationBell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUnreadCount.mockReset();
    mockUsePathname.mockReturnValue("/properties");
    mockedGetUnreadCount.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("oculta el badge cuando el contador es 0 y muestra el enlace a /notifications", async () => {
    render(<NotificationBell initialCount={0} />);

    await waitFor(() => {
      expect(mockedGetUnreadCount).toHaveBeenCalledTimes(1);
    });

    const link = screen.getByRole("link", {
      name: notificationMessages.bellLabel(0),
    });
    expect(link).toHaveAttribute("href", "/notifications");
    expect(link.className).toContain("text-zinc-800");
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("muestra el contador exacto hasta 99, '99+' arriba de 99 y estilo activo en /notifications", async () => {
    mockUsePathname.mockReturnValue("/notifications");
    mockedGetUnreadCount.mockResolvedValueOnce(120);

    render(<NotificationBell initialCount={12} />);

    expect(screen.getByText("12")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("99+")).toBeInTheDocument();
    });

    const link = screen.getByRole("link", {
      name: notificationMessages.bellLabel(120),
    });
    expect(link.className).toContain("text-[#1E4DB7]");
  });

  it("sondea cada 30 segundos, actualiza en focus y evento personalizado, y limpia listeners al desmontar", async () => {
    jest.useFakeTimers();
    mockedGetUnreadCount
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(9);

    const { unmount } = render(<NotificationBell initialCount={0} />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(30000);
    });
    await waitFor(() => {
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.focus(window);
    });
    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();
    });

    await act(async () => {
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    });
    await waitFor(() => {
      expect(screen.getByText("9")).toBeInTheDocument();
    });

    const callsBeforeUnmount = mockedGetUnreadCount.mock.calls.length;
    unmount();

    await act(async () => {
      jest.advanceTimersByTime(30000);
      fireEvent.focus(window);
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    });
    expect(mockedGetUnreadCount).toHaveBeenCalledTimes(callsBeforeUnmount);
  });

  it("ignora silenciosamente errores de red al consultar el contador", async () => {
    mockedGetUnreadCount.mockRejectedValueOnce(new Error("Network error"));

    render(<NotificationBell initialCount={3} />);

    await waitFor(() => {
      expect(mockedGetUnreadCount).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
