import type { ReservationDetail } from "@/types";

export const reservationFixtures: Record<string, ReservationDetail> = {
  "res-01": {
    id: "res-01",
    itemTitle: "Quinta campestre con piscina",
    startDate: "10/11/2026",
    endDate: "12/11/2026",
    daysCount: 3,
    subtotal: 150.0,
    securityDeposit: 50.0,
    total: 200.0,
    dueDate: "09/11/2026 11:59 PM",
    isReadOnly: true,
  },
  "res-02": {
    id: "res-02",
    itemTitle: "Cámara fotográfica profesional Sony A7 III",
    startDate: "15/11/2026",
    endDate: "16/11/2026",
    daysCount: 2,
    subtotal: 80.0,
    securityDeposit: 40.0,
    total: 120.0,
    dueDate: "14/11/2026 08:00 PM",
    isReadOnly: false,
  },
};

export const defaultReservationFixture: ReservationDetail = {
  id: "default",
  itemTitle: "Alquiler de espacio de oficina",
  startDate: "10/11/2026",
  endDate: "12/11/2026",
  daysCount: 3,
  subtotal: 45.0,
  securityDeposit: 50.0,
  total: 95.0,
  dueDate: "09/11/2026 11:59 PM",
  isReadOnly: true,
};
