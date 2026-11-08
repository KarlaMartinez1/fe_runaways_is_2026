import type { UserProfile, RoleRequirements } from "@/types/models";

export const mockUserProfileFixture: UserProfile = {
  id: "user-01",
  fullName: "Jose Escamilla",
  email: "jose.escamilla@correo.com",
  role: "TENANT",
  accountStatus: "VERIFICADA",
  rating: 4.6,
  ratingCount: 8,
  documentType: "DUI",
  documentNumber: "00000000-0",
  memberSince: "Septiembre 2026",
  avatarInitials: "JE",
};

export const mockRoleRequirementsFixture: RoleRequirements = {
  canSwitch: true,
  hasPendingPayments: false,
  hasPendingDeposits: false,
  requirements: [
    {
      id: "verifiedAccount",
      label: "Cuenta verificada",
      unmetLabel: "Cuenta sin verificar · verifica tu identidad",
      met: true,
    },
    {
      id: "noPendingPayments",
      label: "Sin pagos pendientes",
      unmetLabel:
        "Pago pendiente: Alquiler de espacio de oficina · $95.00 · vence 10/11/2026 10:00 AM",
      met: true,
    },
    {
      id: "noPendingDeposits",
      label: "Sin depósitos pendientes de decisión",
      unmetLabel:
        "Depósito pendiente: Alquiler de espacio de oficina · $50.00 en garantía",
      met: true,
    },
  ],
  pendingPaymentDetail: {
    itemTitle: "Alquiler de espacio de oficina",
    amount: "$95.00",
    dueDate: "Vence 10/11/2026 10:00 AM",
  },
  pendingDepositDetail: {
    itemTitle: "Alquiler de espacio de oficina",
    amount: "$50.00",
    dueDate: "Fecha límite: 19/11/2026",
  },
};
