import type { DepositDecisionStatus } from "@/types";

export const depositMessages = {
  pageTitle: "Gestión de depósito de garantía",
  pageSubtitle: "Administra la devolución o retención del depósito para esta reserva.",
  orderInfoTitle: "Información del pedido",
  itemTitleLabel: "Título del bien",
  rentalPeriodLabel: "Período de renta",
  depositAmountLabel: "Monto en garantía",
  statusLabel: "Estado",
  deadlineNotice: (date: string, days: number) =>
    `Fecha límite para decidir: ${date} (faltan ${days} ${days === 1 ? "día" : "días"})`,
  refundButton: "Devolver depósito",
  retainButton: "Retener depósito",
  refundingState: "Procesando devolución...",
  refundSuccessNotice: "¡Depósito devuelto con éxito al arrendatario!",

  // Formulario de retención
  retentionCardTitle: "Retener depósito de garantía",
  retainAmountLabel: "Monto por retener (USD)",
  retainAmountPlaceholder: "Ej. 20.00",
  retainReasonLabel: "Motivo de la retención",
  retainReasonPlaceholder:
    "Describe los daños o motivos encontrados tras la entrega del servicio...",
  differenceHelper: (difference: number) =>
    `Se puede retener un monto parcial. La diferencia sería $${difference.toFixed(2)} USD y se devolverá automáticamente al arrendatario.`,
  fullRetentionHelper:
    "Se retendrá el monto total del depósito de garantía.",
  invalidAmountHelper:
    "El monto por retener no puede superar el monto en garantía disponible.",
  confirmRetentionButton: "Confirmar retención",
  submittingRetentionButton: "Confirmando...",
  cancelButton: "Cancelar",
  retentionSuccessNotice:
    "¡Retención de depósito registrada con éxito! Se ha notificado al arrendatario.",
  errorNotice:
    "Ocurrió un error al procesar la operación. Por favor intenta nuevamente.",

  // Historial de movimientos
  movementsSectionTitle: "Historial de movimientos de la reserva",
  emptyMovements:
    "No se registraron movimientos asociados al depósito de esta reserva.",

  // Helpers
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
} as const;

export const depositMovementHeaders = [
  "Fecha",
  "Tipo",
  "Monto",
  "Motivo",
  "Detalles",
];

export const depositStatusBadges: Record<
  DepositDecisionStatus,
  { label: string; variant: "warning" | "success" | "neutral" }
> = {
  "Pendiente de decisión": {
    label: "Pendiente de decisión",
    variant: "warning",
  },
  Devuelto: {
    label: "Devuelto",
    variant: "success",
  },
  Retenido: {
    label: "Retenido",
    variant: "neutral",
  },
  "Retenido parcialmente": {
    label: "Retenido parcialmente",
    variant: "warning",
  },
};
