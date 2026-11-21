import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleChangeDialog } from "./role-change-dialog";
import { profileMessages, roleDisplayLabels } from "@/lib/messages/profile";

describe("RoleChangeDialog", () => {
  it("retorna null cuando isOpen es false", () => {
    const { container } = render(
      <RoleChangeDialog
        isOpen={false}
        fromRole="TENANT"
        toRole="OWNER"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza transición TENANT -> OWNER y OWNER -> TENANT y ejecuta callbacks", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { rerender } = render(
      <RoleChangeDialog
        isOpen
        fromRole="TENANT"
        toRole="OWNER"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(profileMessages.dialogTitle)).toBeInTheDocument();
    expect(
      screen.getByText(
        profileMessages.dialogBody(
          roleDisplayLabels.TENANT,
          roleDisplayLabels.OWNER
        )
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(profileMessages.dialogConditionsBadge)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogCancelButton })
    );
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <RoleChangeDialog
        isOpen
        fromRole="OWNER"
        toRole="TENANT"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    expect(
      screen.getByText(
        profileMessages.dialogBody(
          roleDisplayLabels.OWNER,
          roleDisplayLabels.TENANT
        )
      )
    ).toBeInTheDocument();
  });

  it("cierra con Escape y backdrop, y bloquea cierre cuando isLoading es true", () => {
    const onCancel = jest.fn();
    const { container, rerender } = render(
      <RoleChangeDialog
        isOpen
        fromRole="TENANT"
        toRole="OWNER"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);

    const backdrop = container.querySelector(
      '.fixed.inset-0[aria-hidden="true"]'
    );
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onCancel).toHaveBeenCalledTimes(2);

    rerender(
      <RoleChangeDialog
        isOpen
        fromRole="TENANT"
        toRole="OWNER"
        onConfirm={jest.fn()}
        onCancel={onCancel}
        isLoading
      />
    );

    expect(
      screen.getByRole("button", { name: profileMessages.dialogCancelButton })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: profileMessages.dialogConfirmingButton,
      })
    ).toBeDisabled();

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(
      container.querySelector('.fixed.inset-0[aria-hidden="true"]')!
    );
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
