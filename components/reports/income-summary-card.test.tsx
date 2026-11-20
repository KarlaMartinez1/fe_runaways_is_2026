import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IncomeSummaryCard } from "./income-summary-card";
import { reportMessages } from "@/lib/messages/reports";

describe("IncomeSummaryCard", () => {
  it("muestra valores formateados por defecto, desde strings y desde números", () => {
    const { rerender } = render(<IncomeSummaryCard />);

    expect(
      screen.getByRole("heading", { name: reportMessages.summary.title })
    ).toBeInTheDocument();
    expect(screen.getAllByText("$0.00")).toHaveLength(3);
    expect(
      screen.getByText(reportMessages.summary.disclaimer)
    ).toBeInTheDocument();

    rerender(
      <IncomeSummaryCard
        rentalIncome="1250.50"
        retainedDepositIncome={150}
        totalIncome="1400.50"
        className="summary-custom"
      />
    );

    expect(screen.getByText("$1,400.50")).toBeInTheDocument();
    expect(screen.getByText("$1,250.50")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });

  it("renderiza esqueleto de carga cuando isLoading es true", () => {
    const { container } = render(<IncomeSummaryCard isLoading />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: reportMessages.summary.title })
    ).not.toBeInTheDocument();
  });

  it("muestra estado de error con botón Reintentar e invoca onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    render(
      <IncomeSummaryCard
        error={reportMessages.errors.loadError}
        onRetry={onRetry}
      />
    );

    expect(
      screen.getByText(reportMessages.errors.loadError)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: reportMessages.errors.retryButton })
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
