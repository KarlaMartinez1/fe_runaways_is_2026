import { render, screen } from "@testing-library/react";
import LessorBookingsPage from "./page";
import { getCurrentUser } from "@/lib/api/auth";
import { bookingRepository, propertyRepository } from "@/lib/repositories";
import { bookingMessages } from "@/lib/messages/bookings";

jest.mock("@/lib/api/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/repositories", () => ({
  bookingRepository: {
    listLessor: jest.fn(),
  },
  propertyRepository: {
    listMine: jest.fn(),
  },
  reviewRepository: {
    getTenantReviewSummary: jest.fn().mockResolvedValue({ average: 5.0, count: 2 }),
  },
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/lessor/bookings",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/components/layout/navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockListLessor = bookingRepository.listLessor as jest.MockedFunction<typeof bookingRepository.listLessor>;
const mockListMine = propertyRepository.listMine as jest.MockedFunction<typeof propertyRepository.listMine>;

describe("LessorBookingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: "owner-1",
      email: "owner@test.com",
      role: "OWNER",
      name: "Owner User",
    });
    mockListMine.mockResolvedValue({
      data: [
        {
          id: "prop-1",
          title: "Centro de recreaciones",
          category: "PROPIEDAD",
          department: "San Salvador",
          municipality: "San Salvador",
          pricePerDay: "100.00",
          securityDeposit: "50.00",
          images: [],
          status: "DISPONIBLE",
          createdAt: "2026-01-01",
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });
  });

  it("renderiza el botón 'Devolver depósito' en la columna de Acciones con enlace a la gestión de depósito", async () => {
    mockListLessor.mockResolvedValueOnce({
      data: [
        {
          id: "booking-123",
          propertyId: "prop-1",
          propertyTitle: "Centro de recreaciones",
          propertyCategory: "PROPIEDAD",
          startDate: "2026-12-11",
          endDate: "2026-12-12",
          days: 2,
          subtotal: "200.00",
          securityDeposit: "50.00",
          status: "FINALIZADA",
          expiresAt: null,
          cancelReason: null,
          deliveredAt: "2026-12-11T08:00:00Z",
          returnedAt: "2026-12-12T18:00:00Z",
          lesseeId: "tenant-1",
          lesseeName: "Joselyn Martinez",
          hasRenterReview: true,
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    const pageElement = await LessorBookingsPage({
      searchParams: Promise.resolve({}),
    });
    render(pageElement);

    expect(screen.getByText(bookingMessages.lessor.title)).toBeInTheDocument();
    expect(screen.getByText("Centro de recreaciones")).toBeInTheDocument();
    expect(screen.getByText("Joselyn Martinez")).toBeInTheDocument();

    const depositLink = screen.getByRole("link", { name: /devolver depósito/i });
    expect(depositLink).toBeInTheDocument();
    expect(depositLink).toHaveAttribute("href", "/deposit?reservationId=booking-123");
  });

  it("muestra el estado vacío cuando no hay reservas", async () => {
    mockListLessor.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });

    const pageElement = await LessorBookingsPage({
      searchParams: Promise.resolve({}),
    });
    render(pageElement);

    expect(screen.getByText(bookingMessages.lessor.empty)).toBeInTheDocument();
  });
});
