import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyOccupancyTable } from "./property-occupancy-table";
import { reportMessages } from "@/lib/messages/reports";
import type { PropertyStatus } from "@/lib/api/types";
import type { PropertyOccupancyItem } from "@/lib/repositories/report-repository";

const sampleItems: PropertyOccupancyItem[] = [
  {
    propertyId: "occ-1",
    title: "Cámara Cinema 6K",
    status: "DISPONIBLE",
    occupiedDays: 1,
    periodDays: 1,
    occupancyRate: 100,
  },
  {
    propertyId: "occ-2",
    title: "Sala de Juntas Norte",
    status: "PAUSADO",
    occupiedDays: 15,
    periodDays: 30,
    occupancyRate: 50,
  },
  {
    propertyId: "occ-3",
    title: "Consola de Audio",
    status: "ELIMINADO",
    occupiedDays: 10,
    periodDays: 30,
    occupancyRate: 33.34,
  },
];

describe("PropertyOccupancyTable", () => {
  it("renderiza filas, tasas con un decimal, estados y período aplicado condicional", () => {
    const itemsWithFallback: PropertyOccupancyItem[] = [
      ...sampleItems,
      {
        propertyId: "occ-4",
        title: "Estudio D",
        status: "AVAILABLE" as PropertyStatus,
        occupiedDays: 0,
        periodDays: 30,
        occupancyRate: 0,
      },
      {
        propertyId: "occ-5",
        title: "Estudio E",
        status: "CUSTOM" as PropertyStatus,
        occupiedDays: 3,
        periodDays: 30,
        occupancyRate: 10,
      },
    ];

    const { rerender } = render(
      <PropertyOccupancyTable
        items={itemsWithFallback}
        from="2025-01-01"
        to="2025-01-01"
        periodDays={1}
        order="desc"
        onOrderChange={jest.fn()}
        onRefresh={jest.fn()}
        currentPage={1}
        totalPages={2}
      />
    );

    expect(
      screen.getByRole("heading", { name: reportMessages.occupancy.title })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        reportMessages.occupancy.periodApplied("2025-01-01", "2025-01-01", 1)
      )
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("Cámara Cinema 6K")).toBeInTheDocument();
    expect(within(table).getByText("100.0 %")).toBeInTheDocument();
    expect(within(table).getByText("50.0 %")).toBeInTheDocument();
    expect(within(table).getByText("33.3 %")).toBeInTheDocument();
    expect(within(table).getAllByText("Disponible")).toHaveLength(2);
    expect(within(table).getByText("Pausado")).toBeInTheDocument();
    expect(within(table).getByText("Eliminado")).toBeInTheDocument();
    expect(within(table).getByText("CUSTOM")).toBeInTheDocument();

    // En móvil muestra singular y plural de días
    expect(screen.getAllByText("1 día")).toHaveLength(2);
    expect(screen.getByText("15 días")).toBeInTheDocument();

    rerender(
      <PropertyOccupancyTable
        items={sampleItems}
        order="desc"
        onOrderChange={jest.fn()}
        onRefresh={jest.fn()}
        currentPage={1}
        totalPages={1}
      />
    );
    expect(screen.queryByText(/Período aplicado:/)).not.toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay bienes", () => {
    render(
      <PropertyOccupancyTable
        items={[]}
        order="desc"
        onOrderChange={jest.fn()}
        onRefresh={jest.fn()}
        currentPage={1}
        totalPages={0}
      />
    );

    expect(
      within(screen.getByRole("table")).getByText(
        reportMessages.byProperty.noProperties
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
  });

  it("muestra estado de carga y deshabilita controles", () => {
    render(
      <PropertyOccupancyTable
        items={sampleItems}
        order="desc"
        onOrderChange={jest.fn()}
        onRefresh={jest.fn()}
        currentPage={1}
        totalPages={2}
        isLoading
      />
    );

    expect(
      within(screen.getByRole("table")).getByText("Cargando tasa de ocupación...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: reportMessages.ratings.updatingButton })
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: reportMessages.occupancy.orderLabel })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("invoca onOrderChange, onRefresh y onPageChange", async () => {
    const user = userEvent.setup();
    const onOrderChange = jest.fn();
    const onRefresh = jest.fn();
    const onPageChange = jest.fn();

    const { rerender } = render(
      <PropertyOccupancyTable
        items={sampleItems}
        order="desc"
        onOrderChange={onOrderChange}
        onRefresh={onRefresh}
        currentPage={1}
        totalPages={2}
        onPageChange={onPageChange}
      />
    );

    await user.click(
      screen.getByRole("combobox", { name: reportMessages.occupancy.orderLabel })
    );
    await user.click(
      screen.getByRole("option", { name: reportMessages.occupancy.orderAsc })
    );
    expect(onOrderChange).toHaveBeenCalledWith("asc");

    await user.click(
      screen.getByRole("button", { name: reportMessages.ratings.updateButton })
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <PropertyOccupancyTable
        items={sampleItems}
        order="asc"
        onOrderChange={onOrderChange}
        onRefresh={onRefresh}
        currentPage={2}
        totalPages={2}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
