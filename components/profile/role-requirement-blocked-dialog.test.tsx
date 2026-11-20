import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleRequirementBlockedDialog } from "./role-requirement-blocked-dialog";
import { profileMessages } from "@/lib/messages/profile";

describe("RoleRequirementBlockedDialog", () => {
  it("retorna null cuando isOpen es false", () => {
    const { container } = render(
      <RoleRequirementBlockedDialog
        isOpen={false}
        type="pending_payment"
        onClose={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza los cuatro tipos de bloqueo, customMessage e itemDetail", () => {
    const { rerender } = render(
      <RoleRequirementBlockedDialog
        isOpen
        type="pending_payment"
        onClose={jest.fn()}
        itemDetail={{
          itemTitle: "Cámara Canon",
          amount: "$45.00",
          dueDate: "10/11/2026",
        }}
      />
    );

    expect(
      screen.getByText(profileMessages.blockedPendingPayment.title)
    ).toBeInTheDocument();
    expect(
      screen.getByText(profileMessages.blockedPendingPayment.body)
    ).toBeInTheDocument();
    expect(screen.getByText("Cámara Canon")).toBeInTheDocument();
    expect(screen.getByText("$45.00 · 10/11/2026")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: profileMessages.blockedPendingPayment.actionButton,
      })
    ).toHaveAttribute("href", profileMessages.blockedPendingPayment.actionHref);

    rerender(
      <RoleRequirementBlockedDialog
        isOpen
        type="unverified_account"
        onClose={jest.fn()}
      />
    );
    expect(
      screen.getByText(profileMessages.blockedUnverifiedAccount.title)
    ).toBeInTheDocument();
    expect(
      screen.getByText(profileMessages.blockedUnverifiedAccount.boxTitle)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: profileMessages.blockedUnverifiedAccount.actionButton,
      })
    ).toHaveAttribute(
      "href",
      profileMessages.blockedUnverifiedAccount.actionHref
    );

    rerender(
      <RoleRequirementBlockedDialog
        isOpen
        type="pending_deposit"
        onClose={jest.fn()}
        itemDetail={{
          itemTitle: "Proyector 4K",
          amount: "$60.00",
          dueDate: "12/11/2026",
        }}
      />
    );
    expect(
      screen.getByText(profileMessages.blockedPendingDeposits.title)
    ).toBeInTheDocument();
    expect(screen.getByText("Proyector 4K")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: profileMessages.blockedPendingDeposits.actionButton,
      })
    ).toHaveAttribute("href", profileMessages.blockedPendingDeposits.actionHref);

    rerender(
      <RoleRequirementBlockedDialog
        isOpen
        type="generic_blocked"
        customMessage="Mensaje personalizado desde backend"
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText("No se puede cambiar el rol")).toBeInTheDocument();
    expect(
      screen.getByText("Mensaje personalizado desde backend")
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("ejecuta onClose con botón Entendido, backdrop y tecla Escape", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    const { container } = render(
      <RoleRequirementBlockedDialog
        isOpen
        type="unverified_account"
        onClose={onClose}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: profileMessages.blockedDialogUnderstandButton,
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);

    const backdrop = container.querySelector(
      '.fixed.inset-0[aria-hidden="true"]'
    );
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
