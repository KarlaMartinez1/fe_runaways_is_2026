import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyRatingsTable } from "./property-ratings-table";
import { reportMessages } from "@/lib/messages/reports";
import type { PropertyStatus } from "@/lib/api/types";
import type { PropertyRatingItem } from "@/lib/repositories/report-repository";

const sampleItems: PropertyRatingItem[] = [
  {
    propertyId: "p-1",
    title: "Cabaña El Pinar",
    status: "DISPONIBLE",
    averageRating: 4.8,
    reviewCount: 1,
  },
  {
    propertyId: "p-2",
    title: "Lancha Rápida",
    status: "PAUSADO",
    averageRating: 4.2,
    reviewCount: 5,
  },
  {
    propertyId: "p-3",
    title: "Generador Eléctrico",
    status: "ELIMINADO",
    averageRating: null,
    reviewCount: 0,
  },
];

describe("PropertyRatingsTable", () => {
  it("renderiza calificaciones, estados, aviso de solo lectura y soporte de variantes en inglés/fallback", () => {
    const itemsWithVariants: PropertyRatingItem[] = [
      ...sampleItems,
      {
        propertyId: "p-4",
        title: "Estudio B",
        status: "AVAILABLE" as PropertyStatus,
        averageRating: 5,
        reviewCount: 2,
      },
      {
        propertyId: "p-5",
        title: "Estudio C",
        status: "UNKNOWN_STATUS" as PropertyStatus,
        averageRating: null,
        reviewCount: 0,
      },
    ];

    render(
      <PropertyRatingsTable
        items={itemsWithVariants}
        order="desc"
        onOrderChange={jest.fn()}
        onRefresh={jest.fn()}
        currentPage={1}
        totalPages={2}
      />
    );

    expect(
      screen.getByRole("heading", { name: reportMessages.ratings.title })
    ).toBeInTheDocument();
    expect(
      screen.getByText(reportMessages.ratings.readOnlyNotice)
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("Cabaña El Pinar")).toBeInTheDocument();
    expect(within(table).getByText("4.8 (1 reseña)")).toBeInTheDocument();
    expect(within(table).getByText("4.2 (5 reseñas)")).toBeInTheDocument();
    expect(within(table).getAllByText("Disponible")).toHaveLength(2);
    expect(within(table).getByText("Pausado")).toBeInTheDocument();
    expect(within(table).getByText("Eliminado")).toBeInTheDocument();
    expect(within(table).getByText("UNKNOWN_STATUS")).toBeInTheDocument();
    expect(within(table).getAllByText("Sin calificaciones")).toHaveLength(2);
  });

  it("muestra estado vacío cuando no hay bienes", () => {
    render(
      <PropertyRatingsTable
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
      <PropertyRatingsTable
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
      within(screen.getByRole("table")).getByText("Cargando calificaciones...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: reportMessages.ratings.updatingButton })
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: reportMessages.ratings.orderLabel })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("invoca onOrderChange, onRefresh y onPageChange", async () => {
    const user = userEvent.setup();
    const onOrderChange = jest.fn();
    const onRefresh = jest.fn();
    const onPageChange = jest.fn();

    const { rerender } = render(
      <PropertyRatingsTable
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
      screen.getByRole("combobox", { name: reportMessages.ratings.orderLabel })
    );
    await user.click(
      screen.getByRole("option", { name: reportMessages.ratings.orderAsc })
    );
    expect(onOrderChange).toHaveBeenCalledWith("asc");

    await user.click(
      screen.getByRole("button", { name: reportMessages.ratings.updateButton })
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <PropertyRatingsTable
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
