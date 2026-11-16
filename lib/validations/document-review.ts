export const REJECTION_REASON_MIN = 10;
export const REJECTION_REASON_MAX = 300;

// H20: el motivo de rechazo es obligatorio, de 10 a 300 caracteres.
export function isValidRejectionReason(reason: string) {
  const length = reason.trim().length;
  return length >= REJECTION_REASON_MIN && length <= REJECTION_REASON_MAX;
}