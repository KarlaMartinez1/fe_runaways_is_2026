'use client';

import * as React from 'react';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils/cn';
import { depositMessages } from '@/lib/messages/deposit';
import { DepositOrderInfoCard } from './deposit-order-info-card';
import { RetainDepositForm } from './retain-deposit-form';
import { DepositMovementsTable } from './deposit-movements-table';
import type { DepositInfo, DepositMovement, RetainDepositFormData } from '@/types';

export interface DepositPageBodyProps {
  depositInfo: DepositInfo;
  initialMovements?: DepositMovement[];
  onRefundDeposit?: () => Promise<void>;
  onRetainDeposit?: (data: RetainDepositFormData) => Promise<void>;
  className?: string;
}

export function DepositPageBody({
  depositInfo,
  initialMovements = [],
  onRefundDeposit,
  onRetainDeposit,
  className,
}: DepositPageBodyProps) {
  const [movements, setMovements] =
    React.useState<DepositMovement[]>(initialMovements);
  const [currentDeposit, setCurrentDeposit] =
    React.useState<DepositInfo>(depositInfo);
  const [isRefunding, setIsRefunding] = React.useState(false);
  const [showRetentionForm, setShowRetentionForm] = React.useState(false);
  const [actionNotice, setActionNotice] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleRefund = async () => {
    setIsRefunding(true);
    setActionNotice(null);
    setShowRetentionForm(false);
    try {
      if (onRefundDeposit) {
        await onRefundDeposit();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setCurrentDeposit((prev) => ({
        ...prev,
        status: 'Devuelto',
      }));

      setMovements((prev) => [
        ...prev,
        {
          id: `mov-refund-${Date.now()}`,
          date: new Date().toLocaleDateString('es-ES'),
          type: 'DEVOLUCIÓN',
          amount: currentDeposit.depositAmount,
          reason: 'Devolución de depósito de garantía',
          details: 'Cuenta de origen',
        },
      ]);

      setActionNotice({
        type: 'success',
        text: depositMessages.refundSuccessNotice,
      });
    } catch {
      setActionNotice({
        type: 'error',
        text: depositMessages.errorNotice,
      });
    } finally {
      setIsRefunding(false);
    }
  };

  const handleRetainSubmit = async (data: RetainDepositFormData) => {
    setActionNotice(null);
    try {
      if (onRetainDeposit) {
        await onRetainDeposit(data);
      }

      const isPartial = data.amount < currentDeposit.depositAmount;
      setCurrentDeposit((prev) => ({
        ...prev,
        status: isPartial ? 'Retenido parcialmente' : 'Retenido',
      }));

      const newMovements: DepositMovement[] = [
        ...movements,
        {
          id: `mov-retain-${Date.now()}`,
          date: new Date().toLocaleDateString('es-ES'),
          type: 'RETENCIÓN',
          amount: data.amount,
          reason: data.reason,
          details: 'Retención de garantía',
        },
      ];

      if (isPartial) {
        const refundDifference = currentDeposit.depositAmount - data.amount;
        newMovements.push({
          id: `mov-refund-part-${Date.now()}`,
          date: new Date().toLocaleDateString('es-ES'),
          type: 'DEVOLUCIÓN',
          amount: refundDifference,
          reason: 'Devolución automática de diferencia no retenida',
          details: 'Cuenta de origen',
        });
      }

      setMovements(newMovements);
    } catch {
      setActionNotice({
        type: 'error',
        text: depositMessages.errorNotice,
      });
    }
  };

  return (
    <div className="w-full flex-1 bg-[#f9fafb]">
      <main
        className={cn(
          'mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 md:px-16',
          className
        )}
      >
        <div>
          <Heading
            as="h1"
            size="2xl"
            subtitle={depositMessages.pageSubtitle}
            className="text-gray-950 font-extrabold tracking-tight text-2xl sm:text-3xl"
          >
            {depositMessages.pageTitle}
          </Heading>
        </div>

        {actionNotice && (
          <div
            role="alert"
            className={cn(
              'p-4 rounded-xl text-sm font-medium border',
              actionNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            )}
          >
            {actionNotice.text}
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5 lg:gap-8 items-start">
          <DepositOrderInfoCard
            depositInfo={currentDeposit}
            onRefundClick={handleRefund}
            onRetainClick={() => setShowRetentionForm((prev) => !prev)}
            isRefunding={isRefunding}
            isRetaining={showRetentionForm}
            className="w-full"
          />

          {showRetentionForm && (
            <RetainDepositForm
              depositAmount={currentDeposit.depositAmount}
              onSubmitSuccess={handleRetainSubmit}
              onCancel={() => setShowRetentionForm(false)}
              className="w-full"
            />
          )}
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">
            {depositMessages.movementsSectionTitle}
          </h2>

          <DepositMovementsTable movements={movements} />
        </div>
      </main>
    </div>
  );
}
