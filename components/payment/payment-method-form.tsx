'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { paymentFormMessages } from '@/lib/messages/payment';
import { paymentSchema, type PaymentFormData } from '@/lib/validations/payment';

export interface PaymentMethodFormProps {
  onSuccess?: (data: PaymentFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export function PaymentMethodForm({
  onSuccess,
  onCancel,
  className,
}: PaymentMethodFormProps) {
  const [submissionFeedback, setSubmissionFeedback] = React.useState<string | null>(null);

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
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmissionFeedback(paymentFormMessages.successFeedback);
      onSuccess?.(data);
    } catch {
      setSubmissionFeedback(paymentFormMessages.errorFeedback);
    }
  };

  const handleCancelClick = () => {
    reset();
    setSubmissionFeedback(null);
    onCancel?.();
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
          <div className="p-3.5 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm font-medium">
            {submissionFeedback}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={paymentFormMessages.cardHolderLabel}
            placeholder={paymentFormMessages.cardHolderPlaceholder}
            {...register('cardHolder')}
            error={errors.cardHolder}
          />

          <Input
            label={paymentFormMessages.cardNumberLabel}
            placeholder={paymentFormMessages.cardNumberPlaceholder}
            maxLength={16}
            {...register('cardNumber')}
            error={errors.cardNumber}
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={paymentFormMessages.expiryDateLabel}
              placeholder={paymentFormMessages.expiryDatePlaceholder}
              maxLength={5}
              {...register('expiryDate')}
              error={errors.expiryDate}
            />
            <Input
              label={paymentFormMessages.cvcLabel}
              placeholder={paymentFormMessages.cvcPlaceholder}
              maxLength={4}
              {...register('cvc')}
              error={errors.cvc}
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
            >
              {paymentFormMessages.cancelButton}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
