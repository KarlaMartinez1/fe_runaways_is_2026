import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvailabilityCalendar } from "./availability-calendar";
import { availabilityMessages } from "@/lib/messages/properties";
import { formatLongDate } from "@/lib/utils/dates";

describe("AvailabilityCalendar", () => {
  it("muestra fechas libres y ocupadas en modo lectura sin permitir seleccionarlas", async () => {
    const user = userEvent.setup();
    render(
      <AvailabilityCalendar
        from="2026-11-01"
        to="2026-12-31"
        occupiedDates={["2026-11-12"]}
      />
    );

    expect(
      screen.getByRole("group", { name: availabilityMessages.calendarLabel })
    ).toBeInTheDocument();
    expect(screen.getByText(availabilityMessages.free)).toBeInTheDocument();
    expect(screen.getByText(availabilityMessages.occupied)).toBeInTheDocument();
    expect(
      screen.getByText(`${formatLongDate("2026-11-11")}: ${availabilityMessages.free}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${formatLongDate("2026-11-12")}: ${availabilityMessages.occupied}`)
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: `${formatLongDate("2026-11-11")}: ${availabilityMessages.free}`,
      })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: availabilityMessages.nextMonth })
    );
    expect(screen.getByText("Diciembre 2026")).toBeInTheDocument();
  });
});
