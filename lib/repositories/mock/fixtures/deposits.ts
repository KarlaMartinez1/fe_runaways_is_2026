import type { DepositInfo, DepositMovement } from "@/types";

export const defaultDepositInfo: DepositInfo = {
  id: "dep-01",
  reservationId: "res-01",
  itemTitle: "Alquiler de espacio de oficina",
  rentalPeriod: "Del 10/11/2026 al 12/11/2026",
  depositAmount: 50.0,
  status: "Pendiente de decisión",
  paymentStatus: "Pagada",
  decisionDeadline: "19/11/2026",
  daysRemaining: 7,
};

export const depositInfoFixtures: Record<string, DepositInfo> = {
  "res-01": defaultDepositInfo,
  default: defaultDepositInfo,
};

export const defaultDepositMovements: DepositMovement[] = [
  {
    id: "mov-dep-1",
    date: "10/11/2026",
    type: "COBRO",
    amount: 95.0,
    reason: "Pago de alquiler y depósito iniciado",
    details: "Tarjeta Visa ****4242",
  },
];

export const depositMovementsFixtures: Record<string, DepositMovement[]> = {
  "res-01": defaultDepositMovements,
  default: defaultDepositMovements,
};
