import { z } from 'zod';

export const retainDepositSchema = z.object({
  amount: z
    .number({
      message: 'Ingresa un monto válido',
    })
    .positive('El monto a retener debe ser mayor a 0'),
  reason: z
    .string()
    .min(10, 'El motivo de retención debe tener al menos 10 caracteres')
    .max(500, 'El motivo no puede exceder los 500 caracteres'),
});

export type RetainDepositFormValues = z.infer<typeof retainDepositSchema>;
