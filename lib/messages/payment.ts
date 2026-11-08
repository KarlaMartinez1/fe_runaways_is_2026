import type { PaymentReceiptDetail } from "@/types";

export const paymentMessages = {
  pageTitle: "Pagar reserva",
  pageSubtitle: "Acá encontrarás los detalles de tu reserva.",
  summaryTitle: "Resumen de la reserva",
  readOnlyBadge: "Solo lectura",
  itemTitleLabel: "Título del bien",
  rentalDateLabel: "Fecha de renta",
  daysCountLabel: "Cantidad de días",
  subtotalLabel: "Subtotal de alquiler",
  depositLabel: "Depósito de garantía",
  totalLabel: "Total a pagar",
  formulaNote: "Total = costo del alquiler + depósito de garantía",
  dueNotice: (date: string) => `Pagar antes de: ${date}`,
  daysText: (count: number) => `${count} ${count === 1 ? "día" : "días"}`,
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  formatRentalDateRange: (startDate: string | Date, endDate: string | Date) => {
    const startStr =
      startDate instanceof Date
        ? startDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : startDate?.toString().trim();

    const endStr =
      endDate instanceof Date
        ? endDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : endDate?.toString().trim();

    if (!startStr && !endStr) return "";
    return `Del ${startStr} al ${endStr}`;
  },
} as const;

export const paymentFormMessages = {
  formTitle: "Método de pago",
  cardHolderLabel: "Nombre del titular",
  cardHolderPlaceholder: "Ej. Juan Pérez",
  cardNumberLabel: "Número de tarjeta",
  cardNumberPlaceholder: "Número de tarjeta de 16 dígitos",
  expiryDateLabel: "Vencimiento",
  expiryDatePlaceholder: "MM/AA",
  cvcLabel: "CVC",
  cvcPlaceholder: "CVC",
  cancelButton: "Cancelar",
  submitButton: "Pagar ahora",
  submittingButton: "Procesando pago...",
  successFeedback: "¡Pago realizado con éxito! Redirigiendo a tu reserva...",
  errorFeedback: "Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.",
} as const;

export const paymentStatusLabels: Record<PaymentReceiptDetail["status"], string> = {
  Pagada: "Pagada",
  Devuelta: "Devuelta",
  Retenida: "Retenida",
  Pendiente: "Pendiente",
};
