import { fireEvent, render, screen, within } from "@testing-library/react";
import { RateRenterForm } from "@/components/reviews/rate-renter-form";
import { reviewMessages } from "@/lib/messages/reviews";
import { httpReviewRepository } from "@/lib/repositories/http/review-repository.http";
import { getRatingBlockReason, validateReviewInput } from "./rules";
import { apiPost } from "@/lib/api/client";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/app/actions/renter-reviews", () => ({ submitRenterReviewAction: jest.fn() }));
jest.mock("@/lib/api/client", () => ({ apiGet: jest.fn(), apiPost: jest.fn() }));

describe("H18: Calificar experiencia con arrendatario", () => {
  it("(H18 AC1) permite elegir puntuación y dejar comentario opcional vacío, hasta 200 caracteres", () => {
    render(<RateRenterForm reservationId="reservation-18" />);
    const group = screen.getByRole("radiogroup", { name: reviewMessages.renterRating });
    fireEvent.click(within(group).getByRole("radio", { name: reviewMessages.stars(1) }));
    expect(screen.getByRole("button", { name: reviewMessages.submit })).toBeEnabled();
    const comment = screen.getByLabelText(new RegExp(reviewMessages.renterComment));
    expect(comment).toHaveValue("");
    fireEvent.change(comment, { target: { value: "x".repeat(200) } });
    expect(comment).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("200/200")).toBeInTheDocument();
  });

  it("(H18 AC2) envía la reseña asociada a la reserva y su puntuación y comentario", async () => {
    await httpReviewRepository.submitRenterReview("reservation-18", {
      userRating: 4,
      comment: "Comunicación clara",
    });
    expect(apiPost).toHaveBeenCalledWith(
      "api/v1/reservations/reservation-18/reviews/renter",
      { userRating: 4, comment: "Comunicación clara" },
    );
  });

  it("(H18 AC3) habilita la reseña de reserva finalizada aún no calificada", () => {
    expect(getRatingBlockReason({ status: "FINALIZADA", ratedByMe: false })).toBeNull();
  });

  it("(H18 AC4) bloquea reservas no finalizadas y reservas ya calificadas", () => {
    expect(getRatingBlockReason({ status: "PENDIENTE", ratedByMe: false })).toBe("NOT_FINALIZED");
    expect(getRatingBlockReason({ status: "FINALIZADA", ratedByMe: true })).toBe("ALREADY_REVIEWED");
  });

  it.each([0, 6, 2.5])("(H18 AC5) rechaza la puntuación inválida %s", (rating) => {
    expect(validateReviewInput({ propertyRating: 5, userRating: rating, comment: "" })).toBe(
      reviewMessages.errors.ownerRating,
    );
  });

  it("(H18 AC5) rechaza comentarios mayores a 200 y acepta puntuación válida con comentario opcional", () => {
    expect(validateReviewInput({ propertyRating: 5, userRating: 4, comment: "x".repeat(201) })).toBe(
      reviewMessages.errors.comment,
    );
    expect(validateReviewInput({ propertyRating: 5, userRating: 1 })).toBeNull();
    expect(validateReviewInput({ propertyRating: 5, userRating: 5, comment: "" })).toBeNull();
  });
});
