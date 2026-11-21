import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRatingInput } from "./star-rating-input";
import { reviewMessages } from "@/lib/messages/reviews";

describe("StarRatingInput", () => {
  it("ofrece puntuaciones enteras del 1 al 5 y comunica la opción elegida", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <StarRatingInput
        label={reviewMessages.renterRating}
        value={null}
        onChange={onChange}
      />
    );

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAccessibleName(reviewMessages.stars(1));
    expect(radios[4]).toHaveAccessibleName(reviewMessages.stars(5));

    await user.click(radios[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
