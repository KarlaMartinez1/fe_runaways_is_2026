import { render, screen } from "@testing-library/react";
import { ReportsNav } from "./reports-nav";
import { reportMessages } from "@/lib/messages/reports";

const mockUsePathname = jest.fn(() => "/owner/reports");

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("ReportsNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/owner/reports");
  });

  it("renderiza los tres enlaces de navegación y resalta Ingresos exactamente en /owner/reports", () => {
    render(<ReportsNav className="nav-extra" />);

    const nav = screen.getByRole("navigation", {
      name: "Subnavegación de reportes",
    });
    expect(nav.className).toContain("nav-extra");

    const incomeLink = screen.getByRole("link", {
      name: reportMessages.tabs.income,
    });
    const ratingsLink = screen.getByRole("link", {
      name: reportMessages.tabs.ratings,
    });
    const occupancyLink = screen.getByRole("link", {
      name: reportMessages.tabs.occupancy,
    });

    expect(incomeLink).toHaveAttribute("href", "/owner/reports");
    expect(ratingsLink).toHaveAttribute("href", "/owner/reports/ratings");
    expect(occupancyLink).toHaveAttribute("href", "/owner/reports/occupancy");

    expect(incomeLink.className).toContain("border-[#1E4DB7]");
    expect(ratingsLink.className).not.toContain("border-[#1E4DB7]");
    expect(occupancyLink.className).not.toContain("border-[#1E4DB7]");
  });

  it("resalta la pestaña de Calificaciones o Ocupación según la subruta activa", () => {
    mockUsePathname.mockReturnValue("/owner/reports/ratings");
    const { rerender } = render(<ReportsNav />);

    expect(
      screen.getByRole("link", { name: reportMessages.tabs.ratings }).className
    ).toContain("border-[#1E4DB7]");
    expect(
      screen.getByRole("link", { name: reportMessages.tabs.income }).className
    ).not.toContain("border-[#1E4DB7]");

    mockUsePathname.mockReturnValue("/owner/reports/occupancy");
    rerender(<ReportsNav />);

    expect(
      screen.getByRole("link", { name: reportMessages.tabs.occupancy }).className
    ).toContain("border-[#1E4DB7]");
    expect(
      screen.getByRole("link", { name: reportMessages.tabs.ratings }).className
    ).not.toContain("border-[#1E4DB7]");
  });
});
