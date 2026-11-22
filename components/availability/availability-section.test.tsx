import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvailabilitySection } from "./availability-section";
import { availabilityMessages } from "@/lib/messages/properties";
import { AvailabilityCalendar } from "./availability-calendar";
import { addDaysIso, todayInElSalvador, formatLongDate } from "@/lib/utils/dates";

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

describe("H9. Consulta de disponibilidad de un bien", () => {
  const today = todayInElSalvador();
  const lastDay = addDaysIso(today, 89);

  it("AC1: muestra el calendario de disponibilidad de 90 días", async () => {
    const user = userEvent.setup();
    render(<AvailabilityCalendar from={today} to={lastDay} occupiedDates={[]} />);

    expect(screen.getByText(`${formatLongDate(today)}: Libre`)).toBeInTheDocument();
    for (let month = 0; month < 3; month += 1) {
      if (screen.queryByText(`${formatLongDate(lastDay)}: Libre`)) break;
      await user.click(screen.getByRole("button", { name: availabilityMessages.nextMonth }));
    }
    expect(screen.getByText(`${formatLongDate(lastDay)}: Libre`)).toBeInTheDocument();
    expect(screen.getAllByText(availabilityMessages.free).length).toBeGreaterThan(0);
  });

  it("AC2: deshabilita los días anteriores a hoy y posteriores al período", async () => {
    const user = userEvent.setup();
    const yesterday = addDaysIso(today, -1);
    const tomorrowAfterRange = addDaysIso(lastDay, 1);
    render(<AvailabilityCalendar from={today} to={lastDay} occupiedDates={[]} />);

    const yesterdayCell = screen.queryByText(`${formatLongDate(yesterday)}: ${availabilityMessages.outOfRange}`);
    if (yesterdayCell) {
      expect(yesterdayCell).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: new RegExp(formatLongDate(yesterday)) })).not.toBeInTheDocument();
    }

    for (let month = 0; month < 3; month += 1) {
      if (screen.queryByText(`${formatLongDate(tomorrowAfterRange)}: ${availabilityMessages.outOfRange}`)) break;
      await user.click(screen.getByRole("button", { name: availabilityMessages.nextMonth }));
    }

    expect(screen.getByText(`${formatLongDate(tomorrowAfterRange)}: ${availabilityMessages.outOfRange}`)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: new RegExp(formatLongDate(tomorrowAfterRange)) })).not.toBeInTheDocument();
  });

  it("AC4: marca como no disponibles las fechas ocupadas por reservas activas o bloqueos", () => {
    const occupied = addDaysIso(today, 2);
    render(<AvailabilityCalendar from={today} to={lastDay} occupiedDates={[occupied]} />);

    expect(screen.getByText(`${formatLongDate(occupied)}: ${availabilityMessages.occupied}`)).toBeInTheDocument();
  });

  it("AC5: no muestra quién reservó los días no disponibles", () => {
    const occupied = addDaysIso(today, 2);
    render(<AvailabilityCalendar from={today} to={lastDay} occupiedDates={[occupied]} />);

    expect(screen.getByText(`${formatLongDate(occupied)}: ${availabilityMessages.occupied}`)).toBeInTheDocument();
    expect(screen.queryByText(/reservad[oa] por/i)).not.toBeInTheDocument();
  });

  it('AC6: muestra “Este bien ya no está disponible” cuando el bien está pausado o eliminado', () => {
    render(<AvailabilitySection state={{ status: "unavailable" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Este bien ya no está disponible");
    expect(screen.queryByRole("group", { name: availabilityMessages.calendarLabel })).not.toBeInTheDocument();
  });
});
