import { render, screen } from "@testing-library/react";
import { ProfileInfoCard } from "./profile-info-card";
import {
  accountStatusDisplayLabels,
  profileMessages,
  roleDisplayLabels,
} from "@/lib/messages/profile";
import type { UserProfile } from "@/types/models";

const baseProfile: UserProfile = {
  id: "u-1",
  fullName: "Karina Pérez",
  email: "karina@example.com",
  role: "TENANT",
  accountStatus: "SIN_VERIFICAR",
  rating: 0,
  ratingCount: 0,
  documentType: null,
  documentNumber: null,
  memberSince: "Enero 2025",
};

describe("ProfileInfoCard", () => {
  it("renderiza iniciales calculadas, estado sin verificar, sin calificación, sin documento y botón verificar", () => {
    render(<ProfileInfoCard profile={baseProfile} className="profile-card" />);

    expect(screen.getByText("KP")).toBeInTheDocument();
    expect(screen.getAllByText("Karina Pérez")).toHaveLength(2);
    expect(screen.getAllByText("karina@example.com")).toHaveLength(2);
    expect(screen.getByText(roleDisplayLabels.TENANT)).toBeInTheDocument();
    expect(
      screen.getByText(accountStatusDisplayLabels.SIN_VERIFICAR)
    ).toBeInTheDocument();
    expect(
      screen.getByText(profileMessages.formatRating(0, 0))
    ).toBeInTheDocument();
    expect(
      screen.getByText(profileMessages.noDocumentRegistered)
    ).toBeInTheDocument();
    expect(screen.getByText("Enero 2025")).toBeInTheDocument();

    const verifyLink = screen.getByRole("link", {
      name: profileMessages.verifyAccountButton,
    });
    expect(verifyLink).toHaveAttribute("href", "/profile/verification");
  });

  it("renderiza cuenta verificada con documento, calificación positiva, avatarInitials y oculta el botón verificar", () => {
    render(
      <ProfileInfoCard
        profile={{
          ...baseProfile,
          role: "OWNER",
          accountStatus: "VERIFICADA",
          rating: 4.9,
          ratingCount: 12,
          documentType: "DUI",
          documentNumber: "01234567-8",
          avatarInitials: "GH",
        }}
      />
    );

    expect(screen.getByText("GH")).toBeInTheDocument();
    expect(screen.getByText(roleDisplayLabels.OWNER)).toBeInTheDocument();
    expect(
      screen.getByText(accountStatusDisplayLabels.VERIFICADA)
    ).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText("12 calificaciones")).toBeInTheDocument();
    expect(screen.getByText("DUI · 01234567-8")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: profileMessages.verifyAccountButton })
    ).not.toBeInTheDocument();
  });

  it("muestra estados PENDIENTE, RECHAZADA, rol ADMIN y documento '---' como no registrado", () => {
    const { rerender } = render(
      <ProfileInfoCard
        profile={{
          ...baseProfile,
          role: "ADMIN",
          accountStatus: "PENDIENTE",
          documentType: "DUI",
          documentNumber: "---",
        }}
      />
    );

    expect(screen.getByText(roleDisplayLabels.ADMIN)).toBeInTheDocument();
    expect(
      screen.getByText(accountStatusDisplayLabels.PENDIENTE)
    ).toBeInTheDocument();
    expect(
      screen.getByText(profileMessages.noDocumentRegistered)
    ).toBeInTheDocument();

    rerender(
      <ProfileInfoCard
        profile={{
          ...baseProfile,
          accountStatus: "RECHAZADA",
        }}
      />
    );
    expect(
      screen.getByText(accountStatusDisplayLabels.RECHAZADA)
    ).toBeInTheDocument();
  });
});
