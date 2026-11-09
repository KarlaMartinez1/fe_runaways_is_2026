import * as React from 'react';
import type { UserRole } from '@/types/models';
import { profileMessages, roleDisplayLabels } from '@/lib/messages/profile';
import { cn } from '@/lib/utils/cn';

export interface RoleChangeDialogProps {
  isOpen: boolean;
  fromRole: UserRole;
  toRole: UserRole;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleChangeDialog({
  isOpen,
  fromRole,
  toRole,
  onConfirm,
  onCancel,
  isLoading = false,
}: RoleChangeDialogProps) {
  // Close on Escape key
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

  const fromRoleLabel = roleDisplayLabels[fromRole];
  const toRoleLabel = roleDisplayLabels[toRole];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-change-dialog-title"
    >
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={isLoading ? undefined : onCancel}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl',
          'animate-in zoom-in-95 duration-150'
        )}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5EEFC] text-[#1E4DB7] text-xl font-bold"
          aria-hidden="true"
        >
          ?
        </div>

        <h3
          id="role-change-dialog-title"
          className="mt-4 text-lg sm:text-xl font-bold tracking-tight text-gray-950"
        >
          {profileMessages.dialogTitle}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {profileMessages.dialogBody(fromRoleLabel, toRoleLabel)}
        </p>

        <div className="mt-3.5">
          <span className="inline-flex items-center rounded-full bg-[#EAF7EE] px-3 py-1 text-xs font-semibold text-[#1D8338]">
            {profileMessages.dialogConditionsBadge}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {profileMessages.dialogCancelButton}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-[#1E4DB7] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#163c91] active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading
              ? profileMessages.dialogConfirmingButton
              : profileMessages.dialogConfirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
