import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schemas & Inferred Types (Top of file)
// ---------------------------------------------------------------------------

export const paymentSchema = z.object({
  cardHolder: z
    .string()
    .min(3, 'El nombre del titular debe tener al menos 3 caracteres')
    .max(80, 'El nombre del titular es demasiado largo'),
  cardNumber: z
    .string()
    .min(1, 'El número de tarjeta es obligatorio')
    .regex(/^\d{16}$/, 'El número de tarjeta debe contener 16 dígitos numéricos'),
  expiryDate: z
    .string()
    .min(1, 'La fecha de vencimiento es obligatoria')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato inválido. Utilice MM/AA'),
  cvc: z
    .string()
    .min(1, 'El CVC es obligatorio')
    .regex(/^\d{3,4}$/, 'El CVC debe tener 3 o 4 dígitos'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
