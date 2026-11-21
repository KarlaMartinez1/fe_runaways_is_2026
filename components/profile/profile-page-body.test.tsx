import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfilePageBody } from "./profile-page-body";
import { profileMessages, roleDisplayLabels } from "@/lib/messages/profile";
import type { UserProfile } from "@/types/models";

const initialProfile: UserProfile = {
  id: "u-10",
  fullName: "Génesis Henríquez",
  email: "genesis@example.com",
  role: "TENANT",
  accountStatus: "VERIFICADA",
  rating: 4.9,
  ratingCount: 8,
  documentType: "DUI",
  documentNumber: "00125123-4",
  memberSince: "Marzo 2025",
};

describe("ProfilePageBody", () => {
  it("renderiza el perfil y actualiza el rol mostrando aviso descartable tras cambio exitoso", async () => {
    const user = userEvent.setup();
    const onUpdateRole = jest.fn().mockResolvedValue({ success: true });

    render(
      <ProfilePageBody
        initialProfile={initialProfile}
        onUpdateRole={onUpdateRole}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: profileMessages.pageTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(profileMessages.pageSubtitle)).toBeInTheDocument();
    const profileRegion = screen.getByRole("region", {
      name: profileMessages.pageTitle,
    });
    expect(within(profileRegion).getByText(roleDisplayLabels.TENANT)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToOwner })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );

    await waitFor(() => {
      expect(onUpdateRole).toHaveBeenCalledWith("OWNER");
    });

    const notice = await screen.findByRole("status");
    expect(notice).toHaveTextContent(
      profileMessages.roleChangeSuccess(roleDisplayLabels.OWNER)
    );
    expect(within(profileRegion).getByText(roleDisplayLabels.OWNER)).toBeInTheDocument();

    // Cerrar aviso de éxito
    await user.click(screen.getByRole("button", { name: "×" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("mantiene el rol actual y abre diálogo bloqueado cuando falla o rechaza onUpdateRole", async () => {
    const user = userEvent.setup();
    const onUpdateRole = jest
      .fn()
      .mockResolvedValueOnce({
        success: false,
        code: "ROLE_CHANGE_BLOCKED",
        message: "Tienes reservas activas",
      })
      .mockRejectedValueOnce(new Error("Fallo inesperado"));

    render(
      <ProfilePageBody
        initialProfile={initialProfile}
        onUpdateRole={onUpdateRole}
      />
    );

    const profileRegion = screen.getByRole("region", {
      name: profileMessages.pageTitle,
    });

    // Fallo estructurado
    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToOwner })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );

    expect(
      await screen.findByText("Tienes reservas activas")
    ).toBeInTheDocument();
    expect(within(profileRegion).getByText(roleDisplayLabels.TENANT)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: profileMessages.blockedDialogUnderstandButton,
      })
    );

    // Rechazo de promesa
    await user.click(
      screen.getByRole("button", { name: profileMessages.buttonSwitchToOwner })
    );
    await user.click(
      screen.getByRole("button", { name: profileMessages.dialogConfirmButton })
    );

    expect(
      await screen.findByText(profileMessages.roleChangeError)
    ).toBeInTheDocument();
    expect(within(profileRegion).getByText(roleDisplayLabels.TENANT)).toBeInTheDocument();
  });
});
