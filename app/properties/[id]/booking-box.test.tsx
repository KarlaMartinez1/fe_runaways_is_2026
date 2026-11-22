import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingBox } from "./booking-box";
import { createBookingAction } from "@/app/actions/bookings";
import { startConversation } from "@/app/actions/messages";
import { bookingMessages } from "@/lib/messages/bookings";
import { availabilityMessages } from "@/lib/messages/properties";
import { addDaysIso, formatLongDate, todayInElSalvador } from "@/lib/utils/dates";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/app/actions/bookings", () => ({
  createBookingAction: jest.fn(),
}));

jest.mock("@/app/actions/messages", () => ({
  startConversation: jest.fn(),
}));

const mockedCreateBooking = createBookingAction as jest.MockedFunction<
  typeof createBookingAction
>;

const today = todayInElSalvador();
const startDate = addDaysIso(today, 5);
const endDate = addDaysIso(today, 7);

async function selectCalendarDate(
  user: ReturnType<typeof userEvent.setup>,
  date: string
) {
  const dateLabel = `${formatLongDate(date)}: Libre`;
  for (let month = 0; month < 3; month += 1) {
    const dateButton = screen.queryByRole("button", { name: dateLabel });
    if (dateButton) {
      await user.click(dateButton);
      return;
    }
    const nextMonth = screen.queryByRole("button", { name: "Mes siguiente" });
    if (!nextMonth || nextMonth.hasAttribute("disabled")) break;
    await user.click(nextMonth);
  }
  throw new Error(`No se encontró la fecha seleccionable ${dateLabel}`);
}

describe("BookingBox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (startConversation as jest.Mock).mockReturnValue(jest.fn());
  });

  it("AC3: al volver a consultar el calendario, muestra la fecha reservada como no disponible", async () => {
    const user = userEvent.setup();
    let resolveBooking: (result: { ok: true; bookingId: string }) => void = () => {};
    mockedCreateBooking.mockImplementation(
      () => new Promise((resolve) => { resolveBooking = resolve; })
    );

    const { rerender } = render(
      <BookingBox
        propertyId="property-1"
        pricePerDay="25.50"
        securityDeposit="30"
        availability={{
          status: "ready",
          from: today,
          to: addDaysIso(today, 60),
          occupiedDates: [],
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: bookingMessages.selectDates }));
    await selectCalendarDate(user, startDate);
    await selectCalendarDate(user, endDate);

    expect(
      within(screen.getByText(bookingMessages.days).parentElement!).getByText("3")
    ).toBeInTheDocument();
    expect(screen.getByText("$76.50")).toBeInTheDocument();
    expect(screen.getByText("$30.00")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: bookingMessages.confirm });
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    const pendingButton = await screen.findByRole("button", {
      name: bookingMessages.confirming,
    });
    expect(pendingButton).toBeDisabled();
    expect(mockedCreateBooking).toHaveBeenCalledWith({
      propertyId: "property-1",
      startDate,
      endDate,
    });

    await act(async () => {
      resolveBooking({ ok: true, bookingId: "booking-1" });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/bookings/mine?created=1");
    });
    expect(mockRefresh).not.toHaveBeenCalled();

    rerender(
      <BookingBox
        propertyId="property-1"
        pricePerDay="25.50"
        securityDeposit="30"
        availability={{
          status: "ready",
          from: today,
          to: addDaysIso(today, 60),
          occupiedDates: [startDate],
        }}
      />
    );

    expect(
      await screen.findByText(`${formatLongDate(startDate)}: ${availabilityMessages.occupied}`)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: `${formatLongDate(startDate)}: ${availabilityMessages.occupied}`,
      })
    ).not.toBeInTheDocument();
  });


});
