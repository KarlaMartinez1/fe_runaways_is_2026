import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvailabilitySection } from "./availability-section";
import { availabilityMessages } from "@/lib/messages/properties";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe("AvailabilitySection", () => {
  it("permite abrir y cerrar el calendario de disponibilidad en modo lectura", async () => {
    const user = userEvent.setup();
    render(
      <AvailabilitySection
        state={{
          status: "ready",
          from: "2026-11-01",
          to: "2026-11-30",
          occupiedDates: ["2026-11-12"],
        }}
      />
    );

    expect(
      screen.queryByRole("group", { name: availabilityMessages.calendarLabel })
    ).not.toBeInTheDocument();

    const openButton = screen.getByRole("button", { name: "Selecciona tus fechas" });
    await user.click(openButton);

    expect(
      screen.getByRole("group", { name: availabilityMessages.calendarLabel })
    ).toBeInTheDocument();
    expect(openButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.queryByRole("button", { name: /de noviembre de 2026:/i })
    ).not.toBeInTheDocument();

    await user.click(openButton);
    expect(
      screen.queryByRole("group", { name: availabilityMessages.calendarLabel })
    ).not.toBeInTheDocument();
    expect(openButton).toHaveAttribute("aria-expanded", "false");
  });
});
