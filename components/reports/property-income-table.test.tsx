import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyIncomeTable } from "./property-income-table";
import { reportMessages } from "@/lib/messages/reports";
import type { PropertyIncomeItem } from "@/lib/repositories/report-repository";

const sampleItems: PropertyIncomeItem[] = [
  {
    propertyId: "prop-1",
    title: "Cámara Sony FX3",
    rentalIncome: "350.00",
    retainedDepositIncome: "50.00",
    totalIncome: "400.00",
  },
  {
    propertyId: "prop-2",
    title: "Apartamento Escalón",
    rentalIncome: "800.00",
    retainedDepositIncome: "0.00",
    totalIncome: "800.00",
  },
];

describe("PropertyIncomeTable", () => {
  it("renderiza filas en tabla de escritorio, tarjetas móviles y total del período", () => {
    render(
      <PropertyIncomeTable
        items={sampleItems}
        totalPeriodIncome="1200.00"
        order="desc"
        onOrderChange={jest.fn()}
        currentPage={1}
        totalPages={2}
        hasDateFilter
      />
    );

    expect(
      screen.getByRole("heading", { name: reportMessages.byProperty.title })
    ).toBeInTheDocument();
    expect(
      screen.getByText(reportMessages.byProperty.periodTotal("$1,200.00"))
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("Cámara Sony FX3")).toBeInTheDocument();
    expect(within(table).getByText("$350.00")).toBeInTheDocument();
    expect(within(table).getByText("$50.00")).toBeInTheDocument();
    expect(within(table).getByText("$400.00")).toBeInTheDocument();
    expect(within(table).getByText("Apartamento Escalón")).toBeInTheDocument();
    expect(screen.getAllByText("Cámara Sony FX3")).toHaveLength(2);
  });

  it("muestra mensajes vacíos según hasDateFilter y oculta total del período sin filtro", () => {
    const { rerender } = render(
      <PropertyIncomeTable
        items={[]}
        totalPeriodIncome="0.00"
        order="desc"
        onOrderChange={jest.fn()}
        currentPage={1}
        totalPages={0}
        hasDateFilter
      />
    );

    const table = screen.getByRole("table");
    expect(
      within(table).getByText(reportMessages.byProperty.noPeriodData)
    ).toBeInTheDocument();

    rerender(
      <PropertyIncomeTable
        items={[]}
        totalPeriodIncome="0.00"
        order="desc"
        onOrderChange={jest.fn()}
        currentPage={1}
        totalPages={0}
        hasDateFilter={false}
      />
    );

    expect(
      screen.queryByText(/Total del período:/)
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).getByText(
        "Selecciona un rango de fechas en el filtro para consultar los ingresos por bien."
      )
    ).toBeInTheDocument();
  });

  it("muestra estado de carga y deshabilita controles", () => {
    render(
      <PropertyIncomeTable
        items={sampleItems}
        totalPeriodIncome="1200.00"
        order="desc"
        onOrderChange={jest.fn()}
        currentPage={2}
        totalPages={3}
        isLoading
      />
    );

    expect(
      within(screen.getByRole("table")).getByText("Cargando información...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: reportMessages.byProperty.orderLabel })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("invoca onOrderChange y onPageChange al interactuar con orden y paginación", async () => {
    const user = userEvent.setup();
    const onOrderChange = jest.fn();
    const onPageChange = jest.fn();

    const { rerender } = render(
      <PropertyIncomeTable
        items={sampleItems}
        totalPeriodIncome="1200.00"
        order="desc"
        onOrderChange={onOrderChange}
        currentPage={1}
        totalPages={2}
        onPageChange={onPageChange}
      />
    );

    await user.click(
      screen.getByRole("combobox", { name: reportMessages.byProperty.orderLabel })
    );
    await user.click(
      screen.getByRole("option", { name: reportMessages.byProperty.orderAsc })
    );
    expect(onOrderChange).toHaveBeenCalledWith("asc");

    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <PropertyIncomeTable
        items={sampleItems}
        totalPeriodIncome="1200.00"
        order="asc"
        onOrderChange={onOrderChange}
        currentPage={2}
        totalPages={2}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
