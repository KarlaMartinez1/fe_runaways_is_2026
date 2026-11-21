import { render, screen } from "@testing-library/react";
import { RoleRequirementsCard } from "./role-requirements-card";
import { profileMessages } from "@/lib/messages/profile";
import type { RoleRequirements } from "@/types/models";

describe("RoleRequirementsCard", () => {
  it("renderiza todos los requisitos cumplidos sin enlace de acción", () => {
    const allMet: RoleRequirements = {
      canSwitch: true,
      requirements: [
        {
          id: "verifiedAccount",
          label: profileMessages.requirements.verifiedAccount,
          met: true,
        },
        {
          id: "noPendingPayments",
          label: profileMessages.requirements.noPendingPayments,
          met: true,
        },
      ],
    };

    render(<RoleRequirementsCard roleRequirements={allMet} className="req-card" />);

    expect(
      screen.getByRole("heading", { name: profileMessages.requirementsTitle })
    ).toBeInTheDocument();
    expect(screen.getAllByText(profileMessages.metBadge)).toHaveLength(2);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("muestra estado pendiente, unmetLabel y enlace correspondiente según requisito incumplido", () => {
    const { rerender } = render(
      <RoleRequirementsCard
        roleRequirements={{
          canSwitch: false,
          requirements: [
            {
              id: "noPendingPayments",
              label: profileMessages.requirements.noPendingPayments,
              unmetLabel: "Tienes 1 pago pendiente",
              met: false,
            },
          ],
        }}
      />
    );

    expect(screen.getByText("Tienes 1 pago pendiente")).toBeInTheDocument();
    expect(screen.getByText(profileMessages.pendingBadge)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: new RegExp(profileMessages.links.goToPay) })
    ).toHaveAttribute("href", "/payment");

    rerender(
      <RoleRequirementsCard
        roleRequirements={{
          canSwitch: false,
          requirements: [
            {
              id: "verifiedAccount",
              label: profileMessages.requirements.verifiedAccount,
              unmetLabel: profileMessages.requirements.verifiedAccountFailed,
              met: false,
            },
          ],
        }}
      />
    );
    expect(
      screen.getByRole("link", {
        name: new RegExp(profileMessages.links.verifyAccount),
      })
    ).toHaveAttribute("href", "/profile/verification");

    rerender(
      <RoleRequirementsCard
        roleRequirements={{
          canSwitch: false,
          requirements: [
            {
              id: "noPendingDeposits",
              label: profileMessages.requirements.noPendingDeposits,
              met: false,
            },
          ],
        }}
      />
    );
    expect(
      screen.getByRole("link", {
        name: new RegExp(profileMessages.links.goToDeposits),
      })
    ).toHaveAttribute("href", "/deposit");
  });
});
