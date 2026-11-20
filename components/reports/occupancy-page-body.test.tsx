import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OccupancyPageBody } from "./occupancy-page-body";
import { reportMessages } from "@/lib/messages/reports";
import { fetchOccupancyDataAction } from "@/app/actions/reports";
import type { PropertyOccupancyListResult } from "@/lib/repositories/report-repository";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => "/owner/reports/occupancy",
}));

jest.mock("@/app/actions/reports", () => ({
  fetchOccupancyDataAction: jest.fn(),
}));

const mockedFetchOccupancy =
  fetchOccupancyDataAction as jest.MockedFunction<
    typeof fetchOccupancyDataAction
  >;

const initialOccupancy: PropertyOccupancyListResult = {
  from: "2025-01-01",
  to: "2025-01-30",
  periodDays: 30,
  data: [
    {
      propertyId: "occ-1",
      title: "Casa Vista al Mar",
      status: "DISPONIBLE",
      occupiedDays: 12,
      periodDays: 30,
      occupancyRate: 40,
    },
  ],
  total: 12,
  page: 1,
  pageSize: 10,
  totalPages: 2,
};

describe("OccupancyPageBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchOccupancy.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renderiza filtro, navegación y tabla de ocupación inicial", () => {
    render(
      <OccupancyPageBody
        initialOccupancy={initialOccupancy}
        initialFrom="2025-01-01"
        initialTo="2025-01-30"
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: reportMessages.pageTitle })
    ).toBeInTheDocument();
    expect(
      screen.getByText(reportMessages.occupancy.filterHelper)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        reportMessages.occupancy.periodApplied("2025-01-01", "2025-01-30", 30)
      )
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).getByText("Casa Vista al Mar")
    ).toBeInTheDocument();
  });

  it("aplica filtro, cambia orden, pagina y limpia filtros sincronizando URL", async () => {
    const user = userEvent.setup();

    const filteredResult: PropertyOccupancyListResult = {
      ...initialOccupancy,
      data: [
        {
          propertyId: "occ-2",
          title: "Estudio Audio Pro",
          status: "DISPONIBLE",
          occupiedDays: 20,
          periodDays: 30,
          occupancyRate: 66.7,
        },
      ],
    };
    const page2Result: PropertyOccupancyListResult = {
      ...filteredResult,
      page: 2,
    };
    const clearedResult: PropertyOccupancyListResult = {
      ...initialOccupancy,
      from: "",
      to: "",
      page: 1,
    };

    mockedFetchOccupancy
      .mockResolvedValueOnce(filteredResult)
      .mockResolvedValueOnce(filteredResult)
      .mockResolvedValueOnce(page2Result)
      .mockResolvedValueOnce(clearedResult);

    render(
      <OccupancyPageBody
        initialOccupancy={initialOccupancy}
        initialFrom="2025-01-01"
        initialTo="2025-01-30"
      />
    );

    // Aplicar filtro
    await user.click(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    );
    await waitFor(() => {
      expect(mockedFetchOccupancy).toHaveBeenCalledWith({
        from: "2025-01-01",
        to: "2025-01-30",
        order: "desc",
        page: 1,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenCalledWith(
      "/owner/reports/occupancy?from=2025-01-01&to=2025-01-30"
    );
    expect(
      within(screen.getByRole("table")).getByText("Estudio Audio Pro")
    ).toBeInTheDocument();

    // Cambiar orden
    await user.click(
      screen.getByRole("combobox", { name: reportMessages.occupancy.orderLabel })
    );
    await user.click(
      screen.getByRole("option", { name: reportMessages.occupancy.orderAsc })
    );
    await waitFor(() => {
      expect(mockedFetchOccupancy).toHaveBeenCalledWith({
        from: "2025-01-01",
        to: "2025-01-30",
        order: "asc",
        page: 1,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenCalledWith(
      "/owner/reports/occupancy?from=2025-01-01&to=2025-01-30&order=asc"
    );

    // Paginación
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await waitFor(() => {
      expect(mockedFetchOccupancy).toHaveBeenCalledWith({
        from: "2025-01-01",
        to: "2025-01-30",
        order: "asc",
        page: 2,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenCalledWith(
      "/owner/reports/occupancy?from=2025-01-01&to=2025-01-30&order=asc&page=2"
    );
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();

    // Limpiar filtro
    await user.click(
      screen.getByRole("button", { name: reportMessages.filter.clearButton })
    );
    await waitFor(() => {
      expect(mockedFetchOccupancy).toHaveBeenCalledWith({
        from: undefined,
        to: undefined,
        order: "asc",
        page: 1,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenLastCalledWith(
      "/owner/reports/occupancy?order=asc"
    );
  });

  it("muestra estado de carga y banner de error con botón Reintentar", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    let resolveRetry: (value: PropertyOccupancyListResult) => void = () => {};
    mockedFetchOccupancy
      .mockRejectedValueOnce(new Error("Fallo de red"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRetry = resolve;
          })
      );

    render(<OccupancyPageBody initialOccupancy={initialOccupancy} />);

    await user.click(
      screen.getByRole("button", { name: reportMessages.ratings.updateButton })
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(reportMessages.errors.loadError);
    expect(consoleSpy).toHaveBeenCalled();

    await user.click(
      within(alert).getByRole("button", {
        name: reportMessages.errors.retryButton,
      })
    );

    expect(
      screen.getByRole("button", { name: reportMessages.ratings.updatingButton })
    ).toBeDisabled();

    await act(async () => {
      resolveRetry(initialOccupancy);
    });

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
