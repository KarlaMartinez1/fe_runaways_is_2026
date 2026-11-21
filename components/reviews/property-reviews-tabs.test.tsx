import { render, screen } from "@testing-library/react";
import { PropertyReviewsTabs } from "./property-reviews-tabs";
import type { ReviewListItem } from "@/lib/api/types";
import { reviewMessages } from "@/lib/messages/reviews";

const review: ReviewListItem = {
  id: "review-1",
  reviewerName: "María López",
  rating: 5,
  comment: "El bien estaba en excelente estado.",
  createdAt: "2026-11-20T10:00:00Z",
};

describe("PropertyReviewsTabs", () => {
  it("muestra la reseña publicada con su puntuación y comentario", () => {
    render(<PropertyReviewsTabs propertyReviews={[review]} />);

    expect(
      screen.getByRole("heading", {
        name: `${reviewMessages.propertyReviews} (1)`,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(review.reviewerName)).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(screen.getByText(review.comment!)).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando aún no hay reseñas", () => {
    render(<PropertyReviewsTabs propertyReviews={[]} />);

    expect(
      screen.getByText(reviewMessages.emptyPropertyReviews)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: `${reviewMessages.propertyReviews} (0)`,
      })
    ).toBeInTheDocument();
  });
});
