import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RateRenterForm } from "./rate-renter-form";
import { submitRenterReviewAction } from "@/app/actions/renter-reviews";
import { reviewMessages } from "@/lib/messages/reviews";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/app/actions/renter-reviews", () => ({
  submitRenterReviewAction: jest.fn(),
}));

const mockedSubmitRenterReview = submitRenterReviewAction as jest.MockedFunction<
  typeof submitRenterReviewAction
>;

describe("RateRenterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("envía la puntuación y el comentario opcional tras confirmar", async () => {
    const user = userEvent.setup();
    mockedSubmitRenterReview.mockResolvedValueOnce({ ok: true });
    render(<RateRenterForm reservationId="reservation-18" />);

    const ratingGroup = screen.getByRole("radiogroup", {
      name: reviewMessages.renterRating,
    });
    await user.click(
      within(ratingGroup).getByRole("radio", { name: reviewMessages.stars(5) })
    );
    await user.type(
      screen.getByLabelText(new RegExp(reviewMessages.renterComment)),
      "Arrendatario responsable"
    );

    await user.click(screen.getByRole("button", { name: reviewMessages.submit }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: reviewMessages.confirmAccept })
    );

    await waitFor(() => {
      expect(mockedSubmitRenterReview).toHaveBeenCalledWith(
        "reservation-18",
        5,
        "Arrendatario responsable"
      );
      expect(mockPush).toHaveBeenCalledWith("/lessor/bookings");
    });
  });

  it("permite hasta 200 caracteres y deshabilita el envío si se supera el límite", async () => {
    const user = userEvent.setup();
    render(<RateRenterForm reservationId="reservation-18" />);

    const ratingGroup = screen.getByRole("radiogroup", {
      name: reviewMessages.renterRating,
    });
    await user.click(
      within(ratingGroup).getByRole("radio", { name: reviewMessages.stars(3) })
    );
    const comment = screen.getByLabelText(new RegExp(reviewMessages.renterComment));
    const submitButton = screen.getByRole("button", { name: reviewMessages.submit });

    fireEvent.change(comment, { target: { value: "x".repeat(200) } });
    expect(screen.getByText("200/200")).toBeInTheDocument();
    expect(submitButton).toBeEnabled();

    fireEvent.change(comment, { target: { value: "x".repeat(201) } });
    expect(screen.getByText("201/200")).toBeInTheDocument();
    expect(comment).toHaveAttribute("aria-invalid", "true");
    expect(submitButton).toBeDisabled();
    expect(mockedSubmitRenterReview).not.toHaveBeenCalled();
  });

  it("mantiene deshabilitado el envío mientras el arrendador no elige puntuación", () => {
    render(<RateRenterForm reservationId="reservation-18" />);

    expect(
      screen.getByRole("button", { name: reviewMessages.submit })
    ).toBeDisabled();
  });
});
