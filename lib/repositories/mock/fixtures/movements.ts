import type { ReservationMovement } from "@/types";

export const reservationMovementsFixtures: Record<string, ReservationMovement[]> = {
  "res-01": [
    {
      id: "mov-1",
      date: "10/11/2026 10:05 AM",
      type: "COBRO",
      amount: 200.0,
      reason: "Pago de reserva exitoso",
      receiptId: "trx-1",
    },
    {
      id: "mov-2",
      date: "12/11/2026 11:30 AM",
      type: "DEVOLUCIÓN",
      amount: 50.0,
      reason: "Devolución automática de depósito",
      receiptId: "trx-2",
    },
  ],
  default: [
    {
      id: "mov-1",
      date: "10/11/2026 10:05 AM",
      type: "COBRO",
      amount: 95.0,
      reason: "Pago de reserva exitoso",
      receiptId: "trx-1",
    },
    {
      id: "mov-2",
      date: "12/11/2026 11:30 AM",
      type: "DEVOLUCIÓN",
      amount: 50.0,
      reason: "Devolución automática de depósito",
      receiptId: "trx-2",
    },
  ],
};
