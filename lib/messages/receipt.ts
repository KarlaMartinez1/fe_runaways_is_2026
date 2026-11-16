import type { MovementType, PaymentReceiptDetail } from "@/types";

export const receiptMessages = {
  pageTitle: "Historial de pagos",
  pageSubtitle: "Movimientos y recibos de tu reserva.",
  movementsTitle: "Movimientos",
  backToReservations: "Volver a mis reservas",
  receiptCardTitle: "Recibo de pago de reserva",
  itemTitleLabel: "Título del bien",
  rentalDateLabel: "Fecha de renta",
  daysCountLabel: "Cantidad de días",
  transactionNumberLabel: "N.º de transacción",
  paymentDateTimeLabel: "Fecha y hora de pago",
  rentalSubtotalLabel: "Subtotal de alquiler",
  securityDepositLabel: "Depósito de garantía",
  totalPaidLabel: "Total pagado",
  paymentMethodLabel: "Tarjeta utilizada",
  emptyMovements: "No se encontraron movimientos registrados para esta reserva.",
  viewReceiptAction: "Ver recibo",
  viewReceiptAriaLabel: (reason: string) => `Ver recibo de ${reason}`,
  daysText: (count: number) => `${count} ${count === 1 ? "día" : "días"}`,
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
} as const;

export const movementTableHeaders: string[] = [
  "Fecha",
  "Tipo",
  "Monto",
  "Motivo",
  "",
];

export const movementTypeLabels: Record<MovementType, string> = {
  COBRO: "COBRO",
  DEVOLUCIÓN: "DEVOLUCIÓN",
  RETENCIÓN: "RETENCIÓN",
};

export const receiptStatusLabels: Record<PaymentReceiptDetail["status"], string> = {
  Pagada: "Pagada",
  Devuelta: "Devuelta",
  Retenida: "Retenida",
  Pendiente: "Pendiente",
};
