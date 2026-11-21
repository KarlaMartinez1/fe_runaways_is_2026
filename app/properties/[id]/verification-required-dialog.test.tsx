import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createBookingAction } from "@/app/actions/bookings";
import { ApiError } from "@/lib/api/client";
import { bookingBoxMessages } from "@/lib/messages/properties";
import { bookingRepository } from "@/lib/repositories";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";
import { VerificationRequiredDialog } from "./verification-required-dialog";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));

jest.mock("@/lib/repositories", () => ({
  bookingRepository: { create: jest.fn() },
}));

const mockedCreate = bookingRepository.create as jest.Mock;

const booking = {
  propertyId: "p-1",
  startDate: addDaysIso(todayInElSalvador(), 1),
  endDate: addDaysIso(todayInElSalvador(), 3),
};

describe("H21. Rentar solo a usuarios verificados", () => {
  beforeEach(() => {
    mockedCreate.mockReset();
  });

  it("AC2: el aviso solo aparece cuando un arrendatario sin verificar intenta reservar", () => {
    render(<VerificationRequiredDialog isOpen={false} onClose={jest.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("AC2: muestra 'Debes verificar tu cuenta para rentar.' con el enlace Verificar mi cuenta", () => {
    render(<VerificationRequiredDialog isOpen onClose={jest.fn()} />);

    expect(screen.getByRole("dialog")).toHaveTextContent(bookingBoxMessages.verificationRequired);
    expect(screen.getByRole("link", { name: bookingBoxMessages.verifyAccount })).toHaveAttribute(
      "href",
      "/profile/verification",
    );
  });

  it("AC2: el aviso se puede cerrar con Entendido o haciendo clic fuera", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<VerificationRequiredDialog isOpen onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: bookingBoxMessages.dialogClose }));
    await user.click(screen.getByRole("button", { name: "Cerrar diálogo" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("AC4 y AC6: si el servidor responde VERIFICATION_REQUIRED no se crea la reserva y se pide verificar la cuenta", async () => {
    mockedCreate.mockRejectedValue(
      new ApiError(403, "VERIFICATION_REQUIRED", bookingBoxMessages.verificationRequired),
    );

    const result = await createBookingAction(booking);

    expect(result).toEqual({
      ok: false,
      message: bookingBoxMessages.verificationRequired,
      verificationRequired: true,
    });
  });

  it("AC3: un arrendatario verificado reserva sin ver el aviso", async () => {
    mockedCreate.mockResolvedValue({ id: "b-1" });

    const result = await createBookingAction(booking);

    expect(mockedCreate).toHaveBeenCalledWith(booking);
    expect(result).toEqual({ ok: true, bookingId: "b-1" });
  });
});