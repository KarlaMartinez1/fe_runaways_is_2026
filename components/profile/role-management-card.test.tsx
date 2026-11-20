import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleManagementCard } from "./role-management-card";
import { profileMessages, roleDisplayLabels } from "@/lib/messages/profile";

describe("RoleManagementCard", () => {
  it("selecciona el rol opuesto por defecto, deshabilita si elige el rol actual y confirma cambio", async () => {
    const user = userEvent.setup();
    const onRoleChange = jest.fn().mockResolvedValue({ success: true });

    render(
      <RoleManagementCard currentRole="TENANT" onRoleChange={onRoleChange} />
    );

    expect(
      screen.getByRole("heading", { name: profileMessages.roleCardTitle })
    ).toBeInTheDocument();
    expect(screen.getAllByText(roleDisplayLabels.TENANT)).toHaveLength(2);

    const switchButton = screen.getByRole("button", {
      name: profileMessages.buttonSwitchToOwner,
    });
    expect(switchButton).toBeEnabled();

    // Seleccionar el rol actualmente activo deshabilita el botón principal
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${profileMessages.tenantRoleTitle}`),
      })
    );
    expect(
      screen.getByRole("button", { name: profileMessages.buttonCurrentRole })
    ).toBeDisabled();

    // Seleccionar Arrendador vuelve a habilitar y abre confirmación
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${profileMessages.ownerRoleTitle}`),
      })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToOwner })
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );
    expect(onRoleChange).toHaveBeenCalledWith("OWNER");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("muestra el diálogo de bloqueo correspondiente según código de error del backend", async () => {
    const user = userEvent.setup();
    const onRoleChange = jest
      .fn()
      .mockResolvedValueOnce({
        success: false,
        code: "ACCOUNT_NOT_VERIFIED",
        message: "Debes verificar primero",
      })
      .mockResolvedValueOnce({
        success: false,
        code: "ROLE_CHANGE_BLOCKED",
        message: "Pago pendiente",
      })
      .mockResolvedValueOnce({
        success: false,
        code: "OTHER_CODE",
        message: "Error genérico",
      });

    const { rerender } = render(
      <RoleManagementCard currentRole="TENANT" onRoleChange={onRoleChange} />
    );

    // 1. ACCOUNT_NOT_VERIFIED
    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToOwner })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );
    expect(
      await screen.findByText(profileMessages.blockedUnverifiedAccount.title)
    ).toBeInTheDocument();
    expect(screen.getByText("Debes verificar primero")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: profileMessages.blockedDialogUnderstandButton,
      })
    );

    // 2. ROLE_CHANGE_BLOCKED como TENANT -> pending_payment (/bookings/mine)
    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToOwner })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );
    expect(
      await screen.findByRole("link", {
        name: profileMessages.blockedPendingPayment.actionButton,
      })
    ).toHaveAttribute("href", "/bookings/mine");
    await user.click(
      screen.getByRole("button", {
        name: profileMessages.blockedDialogUnderstandButton,
      })
    );

    // 3. Código genérico
    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToOwner })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );
    expect(
      await screen.findByText("No se puede cambiar el rol")
    ).toBeInTheDocument();
    expect(screen.getByText("Error genérico")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: profileMessages.blockedDialogUnderstandButton,
      })
    );

    // 4. ROLE_CHANGE_BLOCKED como OWNER -> pending_deposit (/deposit)
    const ownerBlockedFn = jest.fn().mockResolvedValueOnce({
      success: false,
      code: "ROLE_CHANGE_BLOCKED",
      message: "Depósito pendiente",
    });
    rerender(
      <RoleManagementCard currentRole="OWNER" onRoleChange={ownerBlockedFn} />
    );
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${profileMessages.tenantRoleTitle}`),
      })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToTenant })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );
    expect(
      await screen.findByRole("link", {
        name: profileMessages.blockedPendingDeposits.actionButton,
      })
    ).toHaveAttribute("href", "/deposit");
  });

  it("muestra estado de carga cuando isLoading es true", () => {
    render(
      <RoleManagementCard
        currentRole="TENANT"
        onRoleChange={jest.fn()}
        isLoading
      />
    );

    expect(
      screen.getByRole("button", { name: profileMessages.switchingRoleLoading })
    ).toBeDisabled();
  });
});
