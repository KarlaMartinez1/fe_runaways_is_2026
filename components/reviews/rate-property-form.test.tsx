import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatePropertyForm } from "./rate-property-form";
import { submitPropertyReviewAction } from "@/app/actions/reviews";
import { reviewMessages } from "@/lib/messages/reviews";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/app/actions/reviews", () => ({
  submitPropertyReviewAction: jest.fn(),
}));

const mockedSubmitReview = submitPropertyReviewAction as jest.MockedFunction<
  typeof submitPropertyReviewAction
>;

async function chooseRating(
  user: ReturnType<typeof userEvent.setup>,
  group: HTMLElement,
  value: number
) {
  await user.click(
    within(group).getByRole("radio", { name: reviewMessages.stars(value) })
  );
}

describe("RatePropertyForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requiere ambas puntuaciones y no acepta comentarios de más de 200 caracteres", async () => {
    const user = userEvent.setup();
    render(<RatePropertyForm reservationId="reservation-1" />);

    const submitButton = screen.getByRole("button", { name: reviewMessages.submit });
    expect(submitButton).toBeDisabled();

    const groups = screen.getAllByRole("radiogroup");
    await chooseRating(user, groups[0], 5);
    expect(submitButton).toBeDisabled();
    await chooseRating(user, groups[1], 4);
    expect(submitButton).toBeEnabled();

    const comment = screen.getByLabelText(new RegExp(reviewMessages.propertyComment));
    fireEvent.change(comment, { target: { value: "x".repeat(200) } });
    expect(screen.getByText("200/200")).toBeInTheDocument();
    expect(submitButton).toBeEnabled();

    fireEvent.change(comment, { target: { value: "x".repeat(201) } });
    expect(screen.getByText("201/200")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(comment).toHaveAttribute("aria-invalid", "true");
    expect(mockedSubmitReview).not.toHaveBeenCalled();
  });

  it("confirma y envía ambas puntuaciones y el comentario, luego vuelve a Mis reservas", async () => {
    const user = userEvent.setup();
    mockedSubmitReview.mockResolvedValueOnce({ ok: true, reviewCreatedAt: "2026-11-20T10:00:00Z" });
    render(<RatePropertyForm reservationId="reservation-1" />);

    const groups = screen.getAllByRole("radiogroup");
    await chooseRating(user, groups[0], 5);
    await chooseRating(user, groups[1], 4);
    await user.type(
      screen.getByLabelText(new RegExp(reviewMessages.propertyComment)),
      "Excelente experiencia"
    );
    await user.click(screen.getByRole("button", { name: reviewMessages.submit }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: reviewMessages.confirmAccept })
    );

    await waitFor(() => {
      expect(mockedSubmitReview).toHaveBeenCalledWith({
        reservationId: "reservation-1",
        propertyRating: 4,
        userRating: 5,
        comment: "Excelente experiencia",
      });
      expect(mockPush).toHaveBeenCalledWith("/bookings/mine?rated=1");
    });
  });

  it("muestra el error del servidor cuando no se puede publicar la reseña", async () => {
    const user = userEvent.setup();
    mockedSubmitReview.mockResolvedValueOnce({
      ok: false,
      message: reviewMessages.errors.alreadyReviewed,
    });
    render(<RatePropertyForm reservationId="reservation-1" />);

    const groups = screen.getAllByRole("radiogroup");
    await chooseRating(user, groups[0], 3);
    await chooseRating(user, groups[1], 3);
    await user.click(screen.getByRole("button", { name: reviewMessages.submit }));
    await user.click(
      screen.getByRole("button", { name: reviewMessages.confirmAccept })
    );

    await waitFor(() => {
      expect(mockedSubmitReview).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      reviewMessages.errors.alreadyReviewed
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
