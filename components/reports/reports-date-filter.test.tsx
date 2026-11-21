import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportsDateFilter } from "./reports-date-filter";
import { reportMessages } from "@/lib/messages/reports";
import { formatLongDate } from "@/lib/utils/dates";

describe("ReportsDateFilter", () => {
  it("renderiza campos Desde/Hasta, helperText y botones", () => {
    render(
      <ReportsDateFilter
        onApply={jest.fn()}
        onClear={jest.fn()}
        helperText="Texto de ayuda del filtro"
      />
    );

    expect(
      screen.getByLabelText(reportMessages.filter.fromLabel)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(reportMessages.filter.toLabel)
    ).toBeInTheDocument();
    expect(screen.getByText("Texto de ayuda del filtro")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: reportMessages.filter.clearButton })
    ).toBeEnabled();
  });

  it("permite seleccionar fechas desde los calendarios, aplicar y limpiar", async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    const onClear = jest.fn();

    render(
      <ReportsDateFilter
        initialFrom="2025-01-10"
        initialTo="2025-01-20"
        onApply={onApply}
        onClear={onClear}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Abrir calendario para fecha desde" })
    );
    const fromDialog = screen.getByRole("dialog", {
      name: "Seleccionar fecha desde",
    });
    await user.click(
      within(fromDialog).getByRole("button", {
        name: new RegExp(`^${formatLongDate("2025-01-05")}:`),
      })
    );
    expect(
      screen.queryByRole("dialog", { name: "Seleccionar fecha desde" })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Abrir calendario para fecha hasta" })
    );
    const toDialog = screen.getByRole("dialog", {
      name: "Seleccionar fecha hasta",
    });
    await user.click(
      within(toDialog).getByRole("button", {
        name: new RegExp(`^${formatLongDate("2025-01-25")}:`),
      })
    );

    await user.click(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    );

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith({
        from: "2025-01-05",
        to: "2025-01-25",
      });
    });

    // Limpiar solo fecha desde usando el botón interno
    await user.click(
      screen.getByRole("button", { name: "Limpiar fecha desde" })
    );
    expect(
      (screen.getByLabelText(reportMessages.filter.fromLabel) as HTMLInputElement)
        .value
    ).toBe("");

    await user.click(
      screen.getByRole("button", { name: reportMessages.filter.clearButton })
    );
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(
      (screen.getByLabelText(reportMessages.filter.toLabel) as HTMLInputElement)
        .value
    ).toBe("");
  });

  it("cierra el calendario con tecla Escape y clic externo", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside-area">Afuera</div>
        <ReportsDateFilter
          initialFrom="2025-02-10"
          onApply={jest.fn()}
          onClear={jest.fn()}
        />
      </div>
    );

    await user.click(
      screen.getByRole("button", { name: "Abrir calendario para fecha desde" })
    );
    expect(
      screen.getByRole("dialog", { name: "Seleccionar fecha desde" })
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Seleccionar fecha desde" })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Abrir calendario para fecha hasta" })
    );
    expect(
      screen.getByRole("dialog", { name: "Seleccionar fecha hasta" })
    ).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside-area"));
    expect(
      screen.queryByRole("dialog", { name: "Seleccionar fecha hasta" })
    ).not.toBeInTheDocument();
  });

  it("valida rango invertido, período > 365 días, rango incompleto y fechas futuras", () => {
    const { rerender } = render(
      <ReportsDateFilter
        initialFrom="2025-03-20"
        initialTo="2025-03-10"
        onApply={jest.fn()}
        onClear={jest.fn()}
        helperText="Ayuda oculta"
      />
    );

    expect(
      screen.getByText(reportMessages.filter.invalidDateRange)
    ).toBeInTheDocument();
    expect(screen.queryByText("Ayuda oculta")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    ).toBeDisabled();

    rerender(
      <ReportsDateFilter
        initialFrom="2024-01-01"
        initialTo="2025-06-01"
        onApply={jest.fn()}
        onClear={jest.fn()}
        checkMaxDays
      />
    );
    expect(
      screen.getByText(reportMessages.filter.periodExceeded)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    ).toBeDisabled();

    rerender(
      <ReportsDateFilter
        initialFrom="2025-01-01"
        initialTo=""
        onApply={jest.fn()}
        onClear={jest.fn()}
        checkMaxDays
      />
    );
    expect(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    ).toBeDisabled();

    rerender(
      <ReportsDateFilter
        initialFrom="2099-01-01"
        initialTo="2099-01-05"
        onApply={jest.fn()}
        onClear={jest.fn()}
        disallowFutureDates
      />
    );
    expect(
      screen.getByText(reportMessages.filter.futureDateNotAllowed)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    ).toBeDisabled();
  });

  it("deshabilita los botones cuando isLoading es true", () => {
    render(
      <ReportsDateFilter onApply={jest.fn()} onClear={jest.fn()} isLoading />
    );

    expect(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: reportMessages.filter.clearButton })
    ).toBeDisabled();
  });
});
