import { render, screen } from "@testing-library/react";
import OwnerReportsPage from "./page";
import { getCurrentUser } from "@/lib/api/auth";
import { reportRepository } from "@/lib/repositories";
import { reportMessages } from "@/lib/messages/reports";

jest.mock("@/lib/api/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/repositories", () => ({
  reportRepository: {
    getIncomeSummary: jest.fn(),
    getIncomeByProperty: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/owner/reports",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/components/layout/navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockGetIncomeSummary = reportRepository.getIncomeSummary as jest.MockedFunction<
  typeof reportRepository.getIncomeSummary
>;
const mockGetIncomeByProperty = reportRepository.getIncomeByProperty as jest.MockedFunction<
  typeof reportRepository.getIncomeByProperty
>;

describe("OwnerReportsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: "owner-1",
      email: "owner@test.com",
      role: "OWNER",
      name: "Owner Demo",
    });
  });

  it("muestra el total acumulado cuando no hay fechas seleccionadas en el filtro", async () => {
    mockGetIncomeSummary.mockResolvedValueOnce({
      from: null,
      to: null,
      rentalIncome: "20240.00",
      retainedDepositIncome: "1800.00",
      totalIncome: "22040.00",
    });

    const pageElement = await OwnerReportsPage({
      searchParams: Promise.resolve({}),
    });
    render(pageElement);

    expect(mockGetIncomeSummary).toHaveBeenCalledWith({
      from: undefined,
      to: undefined,
    });

    expect(screen.getByText(reportMessages.summary.title)).toBeInTheDocument();
    expect(screen.getByText("$22,040.00")).toBeInTheDocument();
    expect(screen.getByText("$20,240.00")).toBeInTheDocument();
    expect(screen.getByText("$1,800.00")).toBeInTheDocument();
  });

  it("consulta con fechas cuando están presentes en searchParams", async () => {
    mockGetIncomeSummary.mockResolvedValueOnce({
      from: "2026-01-01",
      to: "2026-01-31",
      rentalIncome: "500.00",
      retainedDepositIncome: "50.00",
      totalIncome: "550.00",
    });
    mockGetIncomeByProperty.mockResolvedValueOnce({
      from: "2026-01-01",
      to: "2026-01-31",
      data: [],
      rentalIncome: "500.00",
      retainedDepositIncome: "50.00",
      totalIncome: "550.00",
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });

    const pageElement = await OwnerReportsPage({
      searchParams: Promise.resolve({
        from: "2026-01-01",
        to: "2026-01-31",
      }),
    });
    render(pageElement);

    expect(mockGetIncomeSummary).toHaveBeenCalledWith({
      from: "2026-01-01",
      to: "2026-01-31",
    });
    expect(screen.getByText("$550.00")).toBeInTheDocument();
  });

  it("muestra pantalla de acceso denegado si el usuario no tiene rol OWNER", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      id: "tenant-1",
      email: "tenant@test.com",
      role: "TENANT",
      name: "Tenant Demo",
    });

    const pageElement = await OwnerReportsPage({
      searchParams: Promise.resolve({}),
    });
    render(pageElement);

    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
  });
});
