import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportsPageBody } from "./reports-page-body";
import { reportMessages } from "@/lib/messages/reports";
import { fetchReportsDataAction } from "@/app/actions/reports";
import type {
  IncomeSummary,
  PropertyIncomeListResult,
} from "@/lib/repositories/report-repository";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => "/owner/reports",
}));

jest.mock("@/app/actions/reports", () => ({
  fetchReportsDataAction: jest.fn(),
}));

const mockedFetchReportsData =
  fetchReportsDataAction as jest.MockedFunction<typeof fetchReportsDataAction>;

const initialSummary: IncomeSummary = {
  from: "2025-01-01",
  to: "2025-01-31",
  rentalIncome: "400.00",
  retainedDepositIncome: "50.00",
  totalIncome: "450.00",
};

const initialPropertyIncome: PropertyIncomeListResult = {
  from: "2025-01-01",
  to: "2025-01-31",
  data: [
    {
      propertyId: "prop-1",
      title: "Casa de Playa Costa del Sol",
      rentalIncome: "400.00",
      retainedDepositIncome: "50.00",
      totalIncome: "450.00",
    },
  ],
  totalIncome: "450.00",
  total: 12,
  page: 1,
  pageSize: 10,
  totalPages: 2,
};

describe("ReportsPageBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchReportsData.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renderiza el resumen inicial, la navegación y los ingresos por bien", () => {
    render(
      <ReportsPageBody
        initialSummary={initialSummary}
        initialPropertyIncome={initialPropertyIncome}
        initialFrom="2025-01-01"
        initialTo="2025-01-31"
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: reportMessages.pageTitle })
    ).toBeInTheDocument();
    expect(screen.getAllByText("$450.00").length).toBeGreaterThan(0);
    const table = screen.getByRole("table");
    expect(
      within(table).getByText("Casa de Playa Costa del Sol")
    ).toBeInTheDocument();
  });

  it("actualiza orden, paginación y limpia filtro sincronizando URL", async () => {
    const user = userEvent.setup();

    const ascResult = {
      summary: initialSummary,
      propertyIncome: {
        ...initialPropertyIncome,
        page: 1,
      },
    };
    const page2Result = {
      summary: initialSummary,
      propertyIncome: {
        ...initialPropertyIncome,
        page: 2,
        data: [
          {
            propertyId: "prop-2",
            title: "Proyector 4K",
            rentalIncome: "100.00",
            retainedDepositIncome: "0.00",
            totalIncome: "100.00",
          },
        ],
      },
    };
    const clearedResult = {
      summary: {
        from: null,
        to: null,
        rentalIncome: "0.00",
        retainedDepositIncome: "0.00",
        totalIncome: "0.00",
      },
      propertyIncome: {
        data: [],
        totalIncome: "0.00",
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      },
    };

    mockedFetchReportsData
      .mockResolvedValueOnce(ascResult)
      .mockResolvedValueOnce(page2Result)
      .mockResolvedValueOnce(clearedResult);

    render(
      <ReportsPageBody
        initialSummary={initialSummary}
        initialPropertyIncome={initialPropertyIncome}
        initialFrom="2025-01-01"
        initialTo="2025-01-31"
      />
    );

    // Cambiar orden
    await user.click(
      screen.getByRole("combobox", { name: reportMessages.byProperty.orderLabel })
    );
    await user.click(
      screen.getByRole("option", { name: reportMessages.byProperty.orderAsc })
    );

    await waitFor(() => {
      expect(mockedFetchReportsData).toHaveBeenCalledWith({
        from: "2025-01-01",
        to: "2025-01-31",
        order: "asc",
        page: 1,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenCalledWith(
      "/owner/reports?from=2025-01-01&to=2025-01-31&order=asc"
    );

    // Ir a página 2
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await waitFor(() => {
      expect(mockedFetchReportsData).toHaveBeenCalledWith({
        from: "2025-01-01",
        to: "2025-01-31",
        order: "asc",
        page: 2,
        pageSize: 10,
      });
    });
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).getByText("Proyector 4K")
    ).toBeInTheDocument();

    // Limpiar filtro
    await user.click(
      screen.getByRole("button", { name: reportMessages.filter.clearButton })
    );
    await waitFor(() => {
      expect(mockedFetchReportsData).toHaveBeenCalledWith({
        from: undefined,
        to: undefined,
        order: "asc",
        page: 1,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenLastCalledWith("/owner/reports?order=asc");
  });

  it("muestra estado de carga, error y permite reintentar", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    let resolveRetry: (value: {
      summary: IncomeSummary;
      propertyIncome: PropertyIncomeListResult;
    }) => void = () => {};

    mockedFetchReportsData
      .mockRejectedValueOnce(new Error("Fallo de servidor"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRetry = resolve;
          })
      );

    render(
      <ReportsPageBody
        initialSummary={initialSummary}
        initialPropertyIncome={initialPropertyIncome}
        initialFrom="2025-01-01"
        initialTo="2025-01-31"
      />
    );

    await user.click(
      screen.getByRole("button", { name: reportMessages.filter.applyButton })
    );

    expect(
      await screen.findByText(reportMessages.errors.loadError)
    ).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: reportMessages.errors.retryButton })
    );

    expect(
      screen.queryByText(reportMessages.errors.loadError)
    ).not.toBeInTheDocument();

    await act(async () => {
      resolveRetry({
        summary: initialSummary,
        propertyIncome: initialPropertyIncome,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: reportMessages.summary.title })
      ).toBeInTheDocument();
    });
  });
});
