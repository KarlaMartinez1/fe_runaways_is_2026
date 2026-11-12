import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { depositMessages } from '@/lib/messages/deposit';
import type { DepositInfo } from '@/types';

export interface DepositOrderInfoCardProps {
  depositInfo: DepositInfo;
  onRefundClick?: () => void;
  onRetainClick?: () => void;
  isRefunding?: boolean;
  isRetaining?: boolean;
  className?: string;
}

export function DepositOrderInfoCard({
  depositInfo,
  onRefundClick,
  onRetainClick,
  isRefunding = false,
  isRetaining = false,
  className,
}: DepositOrderInfoCardProps) {
  return (
    <Card padding="md" className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle as="h2" className="text-base sm:text-lg font-bold text-gray-950">
          {depositMessages.orderInfoTitle}
        </CardTitle>
        <Badge variant="success" size="sm" className="px-2.5 py-0.5">
          {depositInfo.paymentStatus}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-500 font-normal">
              {depositMessages.itemTitleLabel}
            </span>
            <span className="text-gray-950 font-bold text-right">
              {depositInfo.itemTitle}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-500 font-normal">
              {depositMessages.rentalPeriodLabel}
            </span>
            <span className="text-gray-950 font-bold text-right">
              {depositInfo.rentalPeriod}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-500 font-normal">
              {depositMessages.depositAmountLabel}
            </span>
            <span className="text-gray-950 font-bold text-right">
              {depositMessages.formatCurrency(depositInfo.depositAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-500 font-normal">
              {depositMessages.statusLabel}
            </span>
            <span className="rounded-md bg-[#fbead2] px-2.5 py-0.5 text-xs font-semibold text-[#8b4513]">
              {depositInfo.status}
            </span>
          </div>
        </div>

        {depositInfo.decisionDeadline && (
          <div className="rounded-xl bg-[#eef3ea] border border-[#dce5d6] px-3.5 py-2.5 text-xs sm:text-sm text-[#415535] font-medium flex items-center">
            <span>
              {depositMessages.deadlineNotice(
                depositInfo.decisionDeadline,
                depositInfo.daysRemaining
              )}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
          <Button
            type="button"
            variant="solid"
            size="md"
            onClick={onRefundClick}
            isLoading={isRefunding}
            className="flex-1 bg-[#1d4ed8] hover:bg-blue-800 text-white font-medium shadow-xs"
          >
            {isRefunding
              ? depositMessages.refundingState
              : depositMessages.refundButton}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onRetainClick}
            className={cn(
              'flex-1 border-[#f3b2b2] text-[#c53030] hover:bg-red-50 hover:border-red-400 font-medium transition-colors',
              isRetaining && 'bg-red-50 border-red-400 ring-2 ring-red-200/60'
            )}
          >
            {depositMessages.retainButton}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
