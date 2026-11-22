import { render, screen } from "@testing-library/react";
import { ProfileInfoCard } from "@/components/profile/profile-info-card";
import { PropertyReviewsTabs } from "@/components/reviews/property-reviews-tabs";
import { mockReviewRepository } from "@/lib/repositories/mock/review-repository.mock";
import { mockPropertyRepository } from "@/lib/repositories/mock/property-repository.mock";
import type { UserProfile } from "@/types/models";
import { detailMessages } from "@/lib/messages/properties";
import { reviewMessages } from "@/lib/messages/reviews";
import {
  getOwnerReviews,
  getPropertyOwnerName,
} from "@/lib/repositories/mock/review-store";
import {
  getRatingBlockReason,
  getReviewDeadline,
  validateReviewInput,
} from "./rules";

describe("Historia 17: calificar una reserva", () => {
  it("AC1: publica la reseña y actualiza las reseñas y promedios del bien y arrendador a un decimal", async () => {
    const propertyBeforeReview = await mockPropertyRepository.getById("p-01");
    const result = await mockReviewRepository.submitPropertyReview("rate-01", {
      propertyRating: 4,
      userRating: 3,
      comment: "Buen equipo y entrega puntual.",
    });
    const property = await mockPropertyRepository.getById("p-01");
    const expectedPropertyAverage = Number(
      (
        ((propertyBeforeReview!.averageRating! * propertyBeforeReview!.reviewCount) + 4) /
        (propertyBeforeReview!.reviewCount + 1)
      ).toFixed(1),
    );

    expect(result.propertyRatingAverage).toBe(expectedPropertyAverage.toFixed(1));
    expect(result.ownerRatingAverage).toBe("3.0");
    expect(result.reviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          propertyRating: 4,
          comment: "Buen equipo y entrega puntual.",
          author: expect.objectContaining({ name: expect.any(String) }),
        }),
      ]),
    );
    expect(property?.propertyReviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rating: 4, comment: "Buen equipo y entrega puntual." }),
      ]),
    );
    render(<PropertyReviewsTabs propertyReviews={property!.propertyReviews!} />);
    expect(screen.getByText("Buen equipo y entrega puntual.")).toBeInTheDocument();
    expect(detailMessages.rating(property!.averageRating!, property!.reviewCount)).toContain(
      property!.averageRating!.toFixed(1),
    );
    expect(property?.ownerAverageRating).toBe(3);
    expect(
      reviewMessages.ownerRatingLine(property!.ownerAverageRating!, property!.ownerReviewCount!),
    ).toBe("★ 3.0 como arrendador (1 reseña)");
    expect(getOwnerReviews(getPropertyOwnerName("p-01"))).toEqual(
      expect.arrayContaining([expect.objectContaining({ rating: 3 })]),
    );

    const ownerProfile: UserProfile = {
      id: "mock-owner",
      fullName: result.owner.name,
      email: "owner@example.test",
      role: "OWNER",
      accountStatus: "VERIFICADA",
      rating: Number(result.ownerRatingAverage),
      ratingCount: result.ownerReviewCount,
      memberSince: "Enero 2025",
    };
    render(<ProfileInfoCard profile={ownerProfile} />);
    expect(screen.getByText("3.0")).toBeInTheDocument();
    expect(screen.getByText("1 calificaciones")).toBeInTheDocument();
  });

  it("AC2: permite calificar hasta el instante límite de 14 días desde que finalizó", () => {
    const finalizedAt = "2026-11-01T15:30:00.000Z";
    const deadline = Date.parse(finalizedAt) + 14 * 24 * 60 * 60 * 1000;
    const reservation = {
      status: "FINALIZADA" as const,
      finalizedAt,
      endDate: "2026-11-01",
      ratedByMe: false,
    };

    expect(getReviewDeadline(finalizedAt)).toBe(deadline);
    expect(getRatingBlockReason(reservation, deadline)).toBeNull();
    expect(getRatingBlockReason(reservation, deadline + 1)).toBe("WINDOW_CLOSED");
  });

  it("AC3: rechaza reservas no finalizadas, ajenas, ya calificadas o fuera del plazo", async () => {
    const pending = await mockReviewRepository.getReservationForReview("rate-04");
    const alreadyRated = await mockReviewRepository.getReservationForReview("rate-03");
    const expired = await mockReviewRepository.getReservationForReview("rate-02");
    const ownedByAnotherTenant = await mockReviewRepository.getReservationForReview("rate-05");

    expect(pending && getRatingBlockReason(pending)).toBe("NOT_FINALIZED");
    expect(alreadyRated && getRatingBlockReason(alreadyRated)).toBe("ALREADY_REVIEWED");
    expect(expired && getRatingBlockReason(expired)).toBe("WINDOW_CLOSED");
    expect(ownedByAnotherTenant).toBeNull();
    await expect(
      mockReviewRepository.submitPropertyReview("rate-05", {
        propertyRating: 5,
        userRating: 5,
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("AC4: solo acepta puntuaciones enteras de 1 a 5 y comentarios de hasta 200 caracteres", () => {
    const valid = { propertyRating: 1, userRating: 5, comment: "x".repeat(200) };
    expect(validateReviewInput(valid)).toBeNull();

    for (const invalidRating of [0, 6, 1.5, "5", Number.NaN]) {
      expect(validateReviewInput({ ...valid, propertyRating: invalidRating })).toBe(
        reviewMessages.errors.propertyRating,
      );
      expect(validateReviewInput({ ...valid, userRating: invalidRating })).toBe(
        reviewMessages.errors.ownerRating,
      );
    }
    expect(validateReviewInput({ ...valid, comment: "x".repeat(201) })).toBe(
      reviewMessages.errors.comment,
    );
  });
});
