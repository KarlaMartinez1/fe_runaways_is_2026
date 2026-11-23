import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockManager } from "./block-manager";
import { createBlockAction, deleteBlockAction } from "@/app/actions/blocks";
import type { NoAvailabilityBlock } from "@/lib/api/types";
import { blockMessages } from "@/lib/messages/blocks";
import { availabilityMessages } from "@/lib/messages/properties";
import { addDaysIso, formatLongDate, todayInElSalvador } from "@/lib/utils/dates";
import { formatShortDate, formatShortRange } from "@/lib/bookings/format";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/app/actions/blocks", () => ({
  createBlockAction: jest.fn(),
  deleteBlockAction: jest.fn(),
}));

const mockedCreateBlock = createBlockAction as jest.MockedFunction<
  typeof createBlockAction
>;
const mockedDeleteBlock = deleteBlockAction as jest.MockedFunction<
  typeof deleteBlockAction
>;

const today = todayInElSalvador();
const startDate = addDaysIso(today, 5);
const endDate = addDaysIso(today, 7);
const sampleBlock: NoAvailabilityBlock = {
  id: "block-1",
  propertyId: "property-1",
  startDate,
  endDate,
  createdAt: `${today}T10:00:00Z`,
};

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

describe("BlockManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateBlock.mockResolvedValue({ ok: true, message: blockMessages.created });
    mockedDeleteBlock.mockResolvedValue({ ok: true, message: blockMessages.deleted });
  });

  it("H12 AC1: crea el bloqueo, lo lista y marca los días como No disponible", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <BlockManager
        propertyId="property-1"
        from={today}
        to={addDaysIso(today, 60)}
        occupiedDates={[]}
        blocks={[]}
      />
    );

    await selectCalendarDate(user, startDate);
    await selectCalendarDate(user, endDate);
    const submitButton = screen.getByRole("button", { name: blockMessages.submit });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(await screen.findByRole("status")).toHaveTextContent(blockMessages.created);
    expect(mockedCreateBlock).toHaveBeenCalledWith("property-1", { startDate, endDate });
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    rerender(
      <BlockManager
        propertyId="property-1"
        from={today}
        to={addDaysIso(today, 60)}
        occupiedDates={[]}
        blocks={[sampleBlock]}
      />
    );
    const blockedLabel = `${formatLongDate(startDate)}: ${availabilityMessages.occupied}`;
    expect(screen.getByText(formatShortDate(startDate))).toBeInTheDocument();
    expect(screen.getByText(formatShortDate(endDate))).toBeInTheDocument();
    expect(screen.getByText(blockedLabel)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: blockedLabel })).not.toBeInTheDocument();
  });

  it("H12 AC5: rechaza un rango que se traslapa con una reserva activa", async () => {
    const user = userEvent.setup();
    render(
      <BlockManager
        propertyId="property-1"
        from={today}
        to={addDaysIso(today, 60)}
        occupiedDates={[addDaysIso(today, 6)]}
        blocks={[]}
      />
    );

    await selectCalendarDate(user, startDate);
    await selectCalendarDate(user, endDate);

    expect(await screen.findByRole("alert")).toHaveTextContent(blockMessages.conflict);
    expect(screen.getByRole("button", { name: blockMessages.submit })).toBeDisabled();
    expect(mockedCreateBlock).not.toHaveBeenCalled();
  });

  it("H12 AC2: elimina un bloqueo tras confirmar y vuelve a mostrar sus días libres", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <BlockManager
        propertyId="property-1"
        from={today}
        to={addDaysIso(today, 60)}
        occupiedDates={[]}
        blocks={[sampleBlock]}
      />
    );

    await user.click(screen.getByRole("button", { name: blockMessages.remove }));
    expect(
      screen.getByText(blockMessages.confirmPrompt(formatShortRange(startDate, endDate)))
    ).toBeInTheDocument();
    expect(mockedDeleteBlock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: blockMessages.confirmRemove }));
    await waitFor(() => {
      expect(mockedDeleteBlock).toHaveBeenCalledWith("property-1", "block-1");
    });
    expect(await screen.findByRole("status")).toHaveTextContent(blockMessages.deleted);
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    rerender(
      <BlockManager
        propertyId="property-1"
        from={today}
        to={addDaysIso(today, 60)}
        occupiedDates={[]}
        blocks={[]}
      />
    );
    const freeLabel = `${formatLongDate(startDate)}: ${availabilityMessages.free}`;
    expect(screen.getByText(freeLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: freeLabel })).toBeInTheDocument();
  });

  it("H12 AC3: muestra el mensaje vacío cuando no hay bloqueos", () => {
    render(
      <BlockManager
        propertyId="property-1"
        from={today}
        to={addDaysIso(today, 60)}
        occupiedDates={[]}
        blocks={[]}
      />
    );

    expect(screen.getByText(blockMessages.empty)).toBeInTheDocument();
  });

  it("H12 AC5: rechaza un rango que se traslapa con otro bloqueo del bien", async () => {
    const user = userEvent.setup();
    const blockingRangeStart = addDaysIso(today, 4);
    const blockingRangeEnd = addDaysIso(today, 8);
    render(
      <BlockManager
        propertyId="property-1"
        from={today}
        to={addDaysIso(today, 60)}
        occupiedDates={[]}
        blocks={[sampleBlock]}
      />
    );

    await selectCalendarDate(user, blockingRangeStart);
    await selectCalendarDate(user, blockingRangeEnd);

    expect(await screen.findByRole("alert")).toHaveTextContent(blockMessages.conflict);
    expect(mockedCreateBlock).not.toHaveBeenCalled();
  });
});
