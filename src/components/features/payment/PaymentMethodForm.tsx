'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '@/components/ui';
import { paymentSchema, type PaymentFormData } from '@/lib/validations';

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
      cardHolder: 'Jose Escamilla',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  //Handle asynchronous payment gateway submission with latency simulation
  const onSubmit = async (data: PaymentFormData) => {
    setSubmissionFeedback(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmissionFeedback('¡Pago realizado con éxito! Redirigiendo a tu reserva...');
      onSuccess?.(data);
    } catch {
      setSubmissionFeedback('Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.');
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
          Método de pago
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
            label="Nombre del titular"
            placeholder="Jose Escamilla"
            {...register('cardHolder')}
            error={errors.cardHolder}
          />

          <Input
            label="Número de tarjeta"
            placeholder="Número de tarjeta de 16 dígitos"
            maxLength={16}
            {...register('cardNumber')}
            error={errors.cardNumber}
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Vencimiento"
              placeholder="MM/AA"
              maxLength={5}
              {...register('expiryDate')}
              error={errors.expiryDate}
            />
            <Input
              label="CVC"
              placeholder="CVC"
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
              Pagar y confirmar
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={handleCancelClick}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
