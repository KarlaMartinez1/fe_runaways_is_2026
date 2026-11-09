import type { PaymentReceiptDetail } from "@/types";

export const paymentReceiptFixtures: Record<string, PaymentReceiptDetail> = {
  "trx-1": {
    id: "trx-1",
    status: "Pagada",
    itemTitle: "Alquiler de espacio de oficina",
    rentalDateRange: "Del 10/11/2026 al 12/11/2026",
    daysCount: 3,
    transactionNumber: "TRX-8f9a2b1c",
    paymentDateTime: "10/11/2026 10:05 AM",
    rentalSubtotal: 45.0,
    securityDeposit: 50.0,
    totalPaid: 95.0,
    paymentMethod: "Visa terminada en 4242",
  },
  "trx-2": {
    id: "trx-2",
    status: "Devuelta",
    itemTitle: "Alquiler de espacio de oficina",
    rentalDateRange: "Del 10/11/2026 al 12/11/2026",
    daysCount: 3,
    transactionNumber: "TRX-4a2b6e8f",
    paymentDateTime: "12/11/2026 11:30 AM",
    rentalSubtotal: 0.0,
    securityDeposit: 50.0,
    totalPaid: 50.0,
    paymentMethod: "Visa terminada en 4242",
  },
};
