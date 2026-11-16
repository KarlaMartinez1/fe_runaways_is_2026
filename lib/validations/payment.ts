import { z } from 'zod';
import { paymentFormMessages } from '@/lib/messages/payment';

export const paymentSchema = z.object({
  cardHolder: z
    .string()
    .min(3, paymentFormMessages.cardHolderMinError)
    .max(80, paymentFormMessages.cardHolderMaxError),
  cardNumber: z
    .string()
    .min(1, paymentFormMessages.cardNumberRequiredError)
    .regex(/^\d{16}$/, paymentFormMessages.cardNumberRegexError),
  expiryDate: z
    .string()
    .min(1, paymentFormMessages.expiryDateRequiredError)
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, paymentFormMessages.expiryDateFormatError)
    .refine(
      (val) => {
        const [monthStr, yearStr] = val.split('/');
        const expMonth = parseInt(monthStr, 10);
        const expYear = 2000 + parseInt(yearStr, 10);

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12

        if (expYear < currentYear) {
          return false;
        }
        if (expYear === currentYear && expMonth < currentMonth) {
          return false;
        }
        return true;
      },
      {
        message: paymentFormMessages.expiryDateExpiredError,
      }
    ),
  cvc: z
    .string()
    .min(1, paymentFormMessages.cvcRequiredError)
    .regex(/^\d{3,4}$/, paymentFormMessages.cvcRegexError),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
