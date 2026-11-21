import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvailabilityCalendar } from "./availability-calendar";
import { formatLongDate } from "@/lib/utils/dates";

describe("AvailabilityCalendar seleccionable", () => {
  it("permite elegir días libres y no ofrece como seleccionables los ocupados", async () => {
    const user = userEvent.setup();
    const onSelectDate = jest.fn();
    const occupiedDate = "2026-11-12";
    const freeDate = "2026-11-13";

    render(
      <AvailabilityCalendar
        from="2026-11-01"
        to="2026-11-30"
        occupiedDates={[occupiedDate]}
        onSelectDate={onSelectDate}
      />
    );

    expect(
      screen.queryByRole("button", { name: `${formatLongDate(occupiedDate)}: No disponible` })
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: `${formatLongDate(freeDate)}: Libre` })
    );
    expect(onSelectDate).toHaveBeenCalledWith(freeDate);
  });
});
