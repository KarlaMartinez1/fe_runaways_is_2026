import { render, screen } from "@testing-library/react";
import { RatePropertyBody } from "./rate-property-body";
import type { ReservationForReview } from "@/lib/api/types";
import { reviewMessages } from "@/lib/messages/reviews";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const reservation: ReservationForReview = {
  id: "reservation-1",
  propertyId: "property-1",
  propertyTitle: "Cámara Sony",
  propertyImage: null,
  startDate: "2026-11-17",
  endDate: "2026-11-19",
  days: 3,
  subtotal: "75.00",
  securityDeposit: "20.00",
  status: "FINALIZADA",
  finalizedAt: "2026-11-19T18:00:00Z",
  ratedByMe: false,
};

describe("h17: RatePropertyBody", () => {
  it("AC2: muestra el formulario para una reserva finalizada dentro del plazo", () => {
    render(<RatePropertyBody reservation={reservation} />);

    expect(
      screen.getByRole("button", { name: reviewMessages.submit })
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("AC3: bloquea reservas no finalizadas, ya calificadas o fuera del plazo", () => {
    const { rerender } = render(
      <RatePropertyBody reservation={{ ...reservation, status: "PENDIENTE" }} />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      reviewMessages.errors.notFinalized
    );
    expect(screen.queryByRole("button", { name: reviewMessages.submit })).not.toBeInTheDocument();

    rerender(
      <RatePropertyBody reservation={{ ...reservation, ratedByMe: true }} />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      reviewMessages.errors.alreadyReviewed
    );

    rerender(
      <RatePropertyBody
        reservation={{
          ...reservation,
          endDate: "2020-01-01",
          finalizedAt: "2020-01-01T12:00:00.000Z",
        }}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      reviewMessages.errors.windowClosed
    );
  });
});
