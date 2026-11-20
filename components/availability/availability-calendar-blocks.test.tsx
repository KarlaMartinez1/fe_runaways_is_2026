import { render, screen } from "@testing-library/react";
import { AvailabilityCalendar } from "./availability-calendar";
import { availabilityMessages } from "@/lib/messages/properties";
import { formatLongDate } from "@/lib/utils/dates";

describe("AvailabilityCalendar con fechas bloqueadas", () => {
  it("muestra el bloqueo como No disponible y no permite seleccionar ese día", () => {
    const blockedDate = "2026-11-12";
    render(
      <AvailabilityCalendar
        from="2026-11-01"
        to="2026-11-30"
        occupiedDates={[blockedDate]}
        onSelectDate={jest.fn()}
      />
    );

    const blockedLabel = `${formatLongDate(blockedDate)}: ${availabilityMessages.occupied}`;
    expect(screen.getByText(blockedLabel)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: blockedLabel })).not.toBeInTheDocument();
  });
});
