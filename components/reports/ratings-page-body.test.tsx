import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingsPageBody } from "./ratings-page-body";
import { reportMessages } from "@/lib/messages/reports";
import { fetchRatingsDataAction } from "@/app/actions/reports";
import type { PropertyRatingListResult } from "@/lib/repositories/report-repository";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => "/owner/reports/ratings",
}));

jest.mock("@/app/actions/reports", () => ({
  fetchRatingsDataAction: jest.fn(),
}));

const mockedFetchRatings = fetchRatingsDataAction as jest.MockedFunction<
  typeof fetchRatingsDataAction
>;

const initialRatings: PropertyRatingListResult = {
  data: [
    {
      propertyId: "prop-1",
      title: "Casa del Lago",
      status: "DISPONIBLE",
      averageRating: 4.9,
      reviewCount: 4,
    },
  ],
  total: 12,
  page: 1,
  pageSize: 10,
  totalPages: 2,
};

describe("RatingsPageBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchRatings.mockReset();
    window.history.replaceState({}, "", "/owner/reports/ratings");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renderiza el reporte inicial y sincroniza orden, paginación y actualización", async () => {
    const user = userEvent.setup();

    const ascPage1: PropertyRatingListResult = {
      ...initialRatings,
      data: [
        {
          propertyId: "prop-2",
          title: "Equipo de Sonido",
          status: "PAUSADO",
          averageRating: 3.5,
          reviewCount: 2,
        },
      ],
    };
    const ascPage2: PropertyRatingListResult = {
      ...ascPage1,
      page: 2,
      data: [
        {
          propertyId: "prop-3",
          title: "Carpa Grande",
          status: "DISPONIBLE",
          averageRating: 4.0,
          reviewCount: 1,
        },
      ],
    };

    mockedFetchRatings
      .mockResolvedValueOnce(ascPage1)
      .mockResolvedValueOnce(ascPage2)
      .mockResolvedValueOnce(ascPage2);

    render(<RatingsPageBody initialRatings={initialRatings} />);

    expect(
      screen.getByRole("heading", { level: 1, name: reportMessages.pageTitle })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).getByText("Casa del Lago")
    ).toBeInTheDocument();

    // Cambiar orden
    await user.click(
      screen.getByRole("combobox", { name: reportMessages.ratings.orderLabel })
    );
    await user.click(
      screen.getByRole("option", { name: reportMessages.ratings.orderAsc })
    );

    await waitFor(() => {
      expect(mockedFetchRatings).toHaveBeenCalledWith({
        order: "asc",
        page: 1,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenCalledWith("/owner/reports/ratings?order=asc");
    expect(
      within(screen.getByRole("table")).getByText("Equipo de Sonido")
    ).toBeInTheDocument();

    // Cambiar página
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await waitFor(() => {
      expect(mockedFetchRatings).toHaveBeenCalledWith({
        order: "asc",
        page: 2,
        pageSize: 10,
      });
    });
    expect(mockReplace).toHaveBeenCalledWith(
      "/owner/reports/ratings?order=asc&page=2"
    );
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();

    // Actualizar manualmente
    await user.click(
      screen.getByRole("button", { name: reportMessages.ratings.updateButton })
    );
    await waitFor(() => {
      expect(mockedFetchRatings).toHaveBeenCalledTimes(3);
    });
  });

  it("muestra carga, estado de error y permite reintentar", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    let resolveRetry: (value: PropertyRatingListResult) => void = () => {};
    mockedFetchRatings
      .mockRejectedValueOnce(new Error("Error de carga"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRetry = resolve;
          })
      );

    render(<RatingsPageBody initialRatings={initialRatings} />);

    await user.click(
      screen.getByRole("button", { name: reportMessages.ratings.updateButton })
    );

    expect(
      await screen.findByText(reportMessages.errors.loadError)
    ).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: reportMessages.errors.retryButton })
    );

    expect(
      screen.getByRole("button", { name: reportMessages.ratings.updatingButton })
    ).toBeDisabled();

    await act(async () => {
      resolveRetry(initialRatings);
    });

    await waitFor(() => {
      expect(
        within(screen.getByRole("table")).getByText("Casa del Lago")
      ).toBeInTheDocument();
    });
  });
});
