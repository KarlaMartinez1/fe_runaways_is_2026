'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { paymentFormMessages } from '@/lib/messages/payment';
import { paymentSchema, type PaymentFormData } from '@/lib/validations/payment';
import { processSimulatedPayment, PaymentGatewayError } from '@/lib/payments/gateway';
import type { BackendPaymentReceipt } from '@/lib/api/types';

export interface PaymentMethodFormProps {
  bookingId?: string;
  endpointUrl?: string;
  onSuccess?: (data: PaymentFormData, receipt?: BackendPaymentReceipt) => void;
  onCancel?: () => void;
  className?: string;
}

export function PaymentMethodForm({
  bookingId,
  endpointUrl = '/payments',
  onSuccess,
  onCancel,
  className,
}: PaymentMethodFormProps) {
  const router = useRouter();
  const [submissionFeedback, setSubmissionFeedback] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardHolder: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setSubmissionFeedback(null);
    setErrorMessage(null);

    if (!bookingId) {
      setErrorMessage(paymentFormMessages.missingBooking);
      return;
    }

    try {
      const receipt = await processSimulatedPayment({
        bookingId,
        cardNumber: data.cardNumber,
        expiryDate: data.expiryDate,
        cvc: data.cvc,
        endpointUrl,
      });

      setSubmissionFeedback(paymentFormMessages.successFeedback);
      onSuccess?.(data, receipt);

      // Redirigir a la vista de recibo (/receipt) con base en la respuesta del backend
      const query = new URLSearchParams({
        reservationId: bookingId,
        bookingId,
        receiptId: receipt.receiptNumber,
        receiptNumber: receipt.receiptNumber,
        title: receipt.propertyTitle || '',
        start: receipt.startDate || '',
        end: receipt.endDate || '',
        days: String(receipt.days || 1),
        subtotal: receipt.rentalAmount || '',
        deposit: receipt.depositAmount || '',
        total: receipt.totalAmount || '',
        last4: receipt.last4Digits || '',
        date: receipt.paymentDate || '',
      });

      setTimeout(() => {
        router.push(`/receipt?${query.toString()}`);
      }, 1200);
    } catch (err) {
      if (err instanceof PaymentGatewayError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(paymentFormMessages.errorFeedback);
      }
    }
  };

  const handleCancelClick = () => {
    reset();
    setSubmissionFeedback(null);
    setErrorMessage(null);
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <Card padding="md" className={className}>
      <CardHeader>
        <CardTitle as="h2" className="text-lg sm:text-xl font-bold">
          {paymentFormMessages.formTitle}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {submissionFeedback && (
          <div
            role="status"
            className="p-3.5 mb-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-sm font-medium"
          >
            {submissionFeedback}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm font-medium"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={paymentFormMessages.cardHolderLabel}
            placeholder={paymentFormMessages.cardHolderPlaceholder}
            {...register('cardHolder')}
            error={errors.cardHolder}
            disabled={isSubmitting}
          />

          <Input
            label={paymentFormMessages.cardNumberLabel}
            placeholder={paymentFormMessages.cardNumberPlaceholder}
            maxLength={16}
            {...register('cardNumber')}
            error={errors.cardNumber}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={paymentFormMessages.expiryDateLabel}
              placeholder={paymentFormMessages.expiryDatePlaceholder}
              maxLength={5}
              {...register('expiryDate')}
              error={errors.expiryDate}
              disabled={isSubmitting}
            />
            <Input
              label={paymentFormMessages.cvcLabel}
              placeholder={paymentFormMessages.cvcPlaceholder}
              maxLength={4}
              {...register('cvc')}
              error={errors.cvc}
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              variant="solid"
              size="md"
              fullWidth
              isLoading={isSubmitting}
            >
              {isSubmitting
                ? paymentFormMessages.submittingButton
                : paymentFormMessages.submitButton}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={handleCancelClick}
              disabled={isSubmitting}
            >
              {paymentFormMessages.cancelButton}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
