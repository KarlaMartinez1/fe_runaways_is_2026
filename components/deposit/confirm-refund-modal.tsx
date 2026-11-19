'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { depositMessages } from '@/lib/messages/deposit';

export interface ConfirmRefundModalProps {
  isOpen: boolean;
  amount: number;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmRefundModal({
  isOpen,
  amount,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmRefundModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-refund-title"
    >
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={() => !isLoading && onCancel()}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 z-10 space-y-5">
        <div className="space-y-2">
          <h3
            id="confirm-refund-title"
            className="text-lg font-bold text-gray-900"
          >
            ¿Devolver depósito de garantía?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            ¿Estás seguro de que deseas devolver el monto total de{' '}
            <strong className="text-gray-950 font-semibold">
              {depositMessages.formatCurrency(amount)}
            </strong>{' '}
            al arrendatario? Esta acción es definitiva y quedará registrada en el historial de la reserva.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {depositMessages.cancelButton}
          </Button>
          <Button
            type="button"
            variant="solid"
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto bg-[#1d4ed8] hover:bg-blue-800 text-white font-medium"
          >
            Confirmar devolución
          </Button>
        </div>
      </div>
    </div>
  );
}
