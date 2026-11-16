'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { depositMessages } from '@/lib/messages/deposit';
import {
  retainDepositSchema,
  type RetainDepositFormValues,
} from '@/lib/validations/deposit';
import type { RetainDepositFormData } from '@/types';

export interface RetainDepositFormProps {
  depositAmount: number;
  onSubmitSuccess?: (data: RetainDepositFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export function RetainDepositForm({
  depositAmount,
  onSubmitSuccess,
  onCancel,
  className,
}: RetainDepositFormProps) {
  const [submissionFeedback, setSubmissionFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RetainDepositFormValues>({
    resolver: zodResolver(retainDepositSchema),
    defaultValues: {
      amount: 20.0,
      reason:
        'Se encontraron rayones profundos en la mesa de madera después de la entrega del servicio.',
    },
  });

  const currentAmount = useWatch({ control, name: 'amount' });
  const numericAmount = Number(currentAmount) || 0;
  const difference = depositAmount - numericAmount;

  const renderHelperText = () => {
    if (numericAmount <= 0) {
      return null;
    }
    if (numericAmount > depositAmount) {
      return (
        <p className="text-xs text-rose-600 font-medium">
          {depositMessages.invalidAmountHelper}
        </p>
      );
    }
    if (numericAmount === depositAmount) {
      return (
        <p className="text-xs text-zinc-600">
          {depositMessages.fullRetentionHelper}
        </p>
      );
    }
    return (
      <p className="text-xs text-zinc-500 leading-relaxed">
        {depositMessages.differenceHelper(difference)}
      </p>
    );
  };

  const onSubmit = async (values: RetainDepositFormValues) => {
    setSubmissionFeedback(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmissionFeedback({
        type: 'success',
        message: depositMessages.retentionSuccessNotice,
      });
      onSubmitSuccess?.(values);
    } catch {
      setSubmissionFeedback({
        type: 'error',
        message: depositMessages.errorNotice,
      });
    }
  };

  const handleCancelClick = () => {
    reset();
    setSubmissionFeedback(null);
    onCancel?.();
  };

  return (
    <Card padding="md" className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle as="h2" className="text-base sm:text-lg font-bold text-gray-950">
          {depositMessages.retentionCardTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {submissionFeedback && (
          <div
            role="alert"
            className={cn(
              'p-3.5 rounded-xl text-sm font-medium border',
              submissionFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            )}
          >
            {submissionFeedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Input
              label={depositMessages.retainAmountLabel}
              type="number"
              step="0.01"
              min="0"
              max={depositAmount}
              placeholder={depositMessages.retainAmountPlaceholder}
              prefix="$"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount}
            />
            {renderHelperText()}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="retain-reason"
              className="block text-sm font-medium text-zinc-900"
            >
              {depositMessages.retainReasonLabel}
            </label>
            <textarea
              id="retain-reason"
              rows={3}
              placeholder={depositMessages.retainReasonPlaceholder}
              {...register('reason')}
              className={cn(
                'w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent transition-all resize-none',
                errors.reason && 'border-rose-500 focus:ring-rose-500'
              )}
            />
            {errors.reason && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
            <Button
              type="submit"
              variant="solid"
              size="md"
              isLoading={isSubmitting}
              className="flex-1 bg-[#1d4ed8] hover:bg-blue-800 text-white font-medium shadow-xs"
            >
              {isSubmitting
                ? depositMessages.submittingRetentionButton
                : depositMessages.confirmRetentionButton}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCancelClick}
              className="flex-1 border-zinc-200 text-zinc-800 hover:bg-zinc-50 font-medium"
            >
              {depositMessages.cancelButton}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
