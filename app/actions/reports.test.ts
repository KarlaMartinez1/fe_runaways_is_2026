import { fetchReportsDataAction } from "./reports";
import { reportRepository } from "@/lib/repositories";

jest.mock("@/lib/repositories", () => ({
  reportRepository: {
    getIncomeSummary: jest.fn(),
    getIncomeByProperty: jest.fn(),
  },
}));

const mockGetIncomeSummary = reportRepository.getIncomeSummary as jest.MockedFunction<
  typeof reportRepository.getIncomeSummary
>;
const mockGetIncomeByProperty = reportRepository.getIncomeByProperty as jest.MockedFunction<
  typeof reportRepository.getIncomeByProperty
>;

describe("fetchReportsDataAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("obtiene el total acumulado sin fechas en el filtro llamando a getIncomeSummary", async () => {
    mockGetIncomeSummary.mockResolvedValueOnce({
      from: null,
      to: null,
      rentalIncome: "1000.00",
      retainedDepositIncome: "200.00",
      totalIncome: "1200.00",
    });

    const result = await fetchReportsDataAction({
      from: undefined,
      to: undefined,
      order: "desc",
      page: 1,
      pageSize: 10,
    });

    expect(mockGetIncomeSummary).toHaveBeenCalledWith({
      from: undefined,
      to: undefined,
    });
    expect(result.summary.totalIncome).toBe("1200.00");
    expect(result.summary.rentalIncome).toBe("1000.00");
    expect(result.summary.retainedDepositIncome).toBe("200.00");
  });

  it("filtra por fechas cuando se proporcionan en los parámetros", async () => {
    mockGetIncomeSummary.mockResolvedValueOnce({
      from: "2026-02-01",
      to: "2026-02-28",
      rentalIncome: "300.00",
      retainedDepositIncome: "0.00",
      totalIncome: "300.00",
    });
    mockGetIncomeByProperty.mockResolvedValueOnce({
      from: "2026-02-01",
      to: "2026-02-28",
      data: [],
      rentalIncome: "300.00",
      retainedDepositIncome: "0.00",
      totalIncome: "300.00",
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });

    const result = await fetchReportsDataAction({
      from: "2026-02-01",
      to: "2026-02-28",
      order: "asc",
      page: 1,
      pageSize: 10,
    });

    expect(mockGetIncomeSummary).toHaveBeenCalledWith({
      from: "2026-02-01",
      to: "2026-02-28",
    });
    expect(mockGetIncomeByProperty).toHaveBeenCalledWith({
      from: "2026-02-01",
      to: "2026-02-28",
      order: "asc",
      page: 1,
      pageSize: 10,
    });
    expect(result.summary.totalIncome).toBe("300.00");
  });
});
