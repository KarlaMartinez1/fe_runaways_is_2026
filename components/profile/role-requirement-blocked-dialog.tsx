import * as React from 'react';
import Link from 'next/link';
import { profileMessages } from '@/lib/messages/profile';
import { cn } from '@/lib/utils/cn';

export type BlockedReasonType =
  | 'pending_payment'
  | 'unverified_account'
  | 'pending_deposit';

export interface RoleRequirementBlockedDialogProps {
  isOpen: boolean;
  type: BlockedReasonType;
  onClose: () => void;
  itemDetail?: {
    itemTitle: string;
    amount?: string;
    dueDate?: string;
  };
}

export function RoleRequirementBlockedDialog({
  isOpen,
  type,
  onClose,
  itemDetail,
}: RoleRequirementBlockedDialogProps) {
  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isUnverified = type === 'unverified_account';

  // Config according to type
  const config =
    type === 'pending_payment'
      ? {
          title: profileMessages.blockedPendingPayment.title,
          body: profileMessages.blockedPendingPayment.body,
          boxTitle:
            itemDetail?.itemTitle || 'Alquiler de espacio de oficina',
          boxSubtitle:
            itemDetail?.amount && itemDetail?.dueDate
              ? `${itemDetail.amount} · ${itemDetail.dueDate}`
              : '$95.00 · Vence 10/11/2026 10:00 AM',
          actionText: profileMessages.blockedPendingPayment.actionButton,
          actionHref: profileMessages.blockedPendingPayment.actionHref,
          iconBg: 'bg-red-50 text-red-600',
          boxBg: 'bg-[#FFF5F5] border-red-100 text-red-700',
          boxSubtext: 'text-red-500',
        }
      : isUnverified
      ? {
          title: profileMessages.blockedUnverifiedAccount.title,
          body: profileMessages.blockedUnverifiedAccount.body,
          boxTitle: profileMessages.blockedUnverifiedAccount.boxTitle,
          boxSubtitle: profileMessages.blockedUnverifiedAccount.boxSubtitle,
          actionText: profileMessages.blockedUnverifiedAccount.actionButton,
          actionHref: profileMessages.blockedUnverifiedAccount.actionHref,
          iconBg: 'bg-[#FEF3C7] text-[#92400E]',
          boxBg: 'bg-[#FFFBEB] border-amber-200/80 text-amber-900',
          boxSubtext: 'text-amber-700',
        }
      : {
          title: profileMessages.blockedPendingDeposits.title,
          body: profileMessages.blockedPendingDeposits.body,
          boxTitle:
            itemDetail?.itemTitle || 'Alquiler de espacio de oficina',
          boxSubtitle:
            itemDetail?.amount && itemDetail?.dueDate
              ? `${itemDetail.amount} · ${itemDetail.dueDate}`
              : '$50.00 en garantía · Fecha límite: 19/11/2026',
          actionText: profileMessages.blockedPendingDeposits.actionButton,
          actionHref: profileMessages.blockedPendingDeposits.actionHref,
          iconBg: 'bg-red-50 text-red-600',
          boxBg: 'bg-[#FFF5F5] border-red-100 text-red-700',
          boxSubtext: 'text-red-500',
        };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blocked-dialog-title"
    >
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl',
          'animate-in zoom-in-95 duration-150'
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold',
            config.iconBg
          )}
          aria-hidden="true"
        >
          !
        </div>

        <h3
          id="blocked-dialog-title"
          className="mt-4 text-lg sm:text-xl font-bold tracking-tight text-gray-950"
        >
          {config.title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {config.body}
        </p>

        <div
          className={cn(
            'mt-4 rounded-xl border p-3.5 text-left',
            config.boxBg
          )}
        >
          <p className="text-xs sm:text-sm font-semibold">{config.boxTitle}</p>
          <p className={cn('text-xs mt-0.5', config.boxSubtext)}>
            {config.boxSubtitle}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer"
          >
            {profileMessages.blockedDialogUnderstandButton}
          </button>

          <Link
            href={config.actionHref}
            className="rounded-xl bg-[#1E4DB7] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#163c91] active:scale-[0.99] transition-all cursor-pointer shadow-xs inline-flex items-center justify-center"
          >
            {config.actionText}
          </Link>
        </div>
      </div>
    </div>
  );
}
