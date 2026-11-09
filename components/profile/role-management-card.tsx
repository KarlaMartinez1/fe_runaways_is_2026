import * as React from 'react';
import type {
  UserRole,
  RoleRequirements,
  AccountStatus,
} from '@/types/models';
import { profileMessages, roleDisplayLabels } from '@/lib/messages/profile';
import { cn } from '@/lib/utils/cn';
import { RoleChangeDialog } from './role-change-dialog';
import {
  RoleRequirementBlockedDialog,
  type BlockedReasonType,
} from './role-requirement-blocked-dialog';

export interface RoleManagementCardProps {
  currentRole: UserRole;
  accountStatus: AccountStatus;
  roleRequirements: RoleRequirements;
  onRoleChange: (newRole: UserRole) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function RoleManagementCard({
  currentRole,
  accountStatus,
  roleRequirements,
  onRoleChange,
  isLoading = false,
  className,
}: RoleManagementCardProps) {
  const defaultTarget: UserRole = currentRole === 'TENANT' ? 'OWNER' : 'TENANT';
  const [selectedRoleOverride, setSelectedRoleOverride] =
    React.useState<UserRole | null>(null);

  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);
  const [blockedDialogType, setBlockedDialogType] =
    React.useState<BlockedReasonType | null>(null);

  const selectedRole = selectedRoleOverride ?? defaultTarget;
  const isCurrentActive = selectedRole === currentRole;

  // Validation when user clicks the main action button
  const handleActionClick = () => {
    if (isCurrentActive || isLoading) return;

    // 1. Pending payment check applies to BOTH roles
    const paymentReq = roleRequirements.requirements.find(
      (r) => r.id === 'noPendingPayments'
    );
    if (paymentReq && !paymentReq.met) {
      setBlockedDialogType('pending_payment');
      return;
    }

    // 2. Verified account check applies ONLY when switching to Arrendador (OWNER)
    if (selectedRole === 'OWNER') {
      const verifiedReq = roleRequirements.requirements.find(
        (r) => r.id === 'verifiedAccount'
      );
      const isVerified =
        accountStatus === 'VERIFICADA' && (verifiedReq ? verifiedReq.met : true);

      if (!isVerified) {
        setBlockedDialogType('unverified_account');
        return;
      }
    }

    // 3. Deposit decision check applies ONLY when current role is Arrendador (OWNER)
    if (currentRole === 'OWNER') {
      const depositReq = roleRequirements.requirements.find(
        (r) => r.id === 'noPendingDeposits'
      );
      if (depositReq && !depositReq.met) {
        setBlockedDialogType('pending_deposit');
        return;
      }
    }

    // All applicable requirements met -> Open confirmation dialog
    setIsConfirmationOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    try {
      await onRoleChange(selectedRole);
      setIsConfirmationOpen(false);
    } catch {
      // Handled in parent
    }
  };

  const buttonText = isCurrentActive
    ? profileMessages.buttonCurrentRole
    : selectedRole === 'OWNER'
    ? profileMessages.buttonSwitchToOwner
    : profileMessages.buttonSwitchToTenant;

  return (
    <>
      <div
        className={cn(
          'rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 shadow-xs',
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-950">
            {profileMessages.roleCardTitle}
          </h2>
          <span className="inline-flex items-center rounded-full bg-[#EAF0FC] px-2.5 py-0.5 text-xs font-semibold text-[#1E4DB7]">
            {roleDisplayLabels[currentRole]}
          </span>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {profileMessages.roleCardDescription}
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Arrendatario */}
          <button
            type="button"
            onClick={() => setSelectedRoleOverride('TENANT')}
            className={cn(
              'flex flex-col items-start rounded-xl p-4 text-left transition-all cursor-pointer',
              selectedRole === 'TENANT'
                ? 'border-2 border-[#1E4DB7] bg-[#F2F6FC]/80 shadow-xs'
                : 'border border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <span
              className={cn(
                'text-sm font-bold',
                selectedRole === 'TENANT' ? 'text-[#1E4DB7]' : 'text-gray-900'
              )}
            >
              {profileMessages.tenantRoleTitle}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              {profileMessages.tenantRoleSubtitle}
            </span>
          </button>

          {/* Option 2: Arrendador */}
          <button
            type="button"
            onClick={() => setSelectedRoleOverride('OWNER')}
            className={cn(
              'flex flex-col items-start rounded-xl p-4 text-left transition-all cursor-pointer',
              selectedRole === 'OWNER'
                ? 'border-2 border-[#1E4DB7] bg-[#F2F6FC]/80 shadow-xs'
                : 'border border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <span
              className={cn(
                'text-sm font-bold',
                selectedRole === 'OWNER' ? 'text-[#1E4DB7]' : 'text-gray-900'
              )}
            >
              {profileMessages.ownerRoleTitle}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              {profileMessages.ownerRoleSubtitle}
            </span>
          </button>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleActionClick}
            disabled={isCurrentActive || isLoading}
            className={cn(
              'w-full rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all cursor-pointer shadow-xs',
              'bg-[#1E4DB7] hover:bg-[#163c91] active:scale-[0.99]',
              (isCurrentActive || isLoading) &&
                'opacity-50 cursor-not-allowed hover:bg-[#1E4DB7] active:scale-100'
            )}
          >
            {isLoading ? profileMessages.switchingRoleLoading : buttonText}
          </button>

          <p className="mt-3 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
            {profileMessages.disclaimerText}
          </p>
        </div>
      </div>

      <RoleChangeDialog
        isOpen={isConfirmationOpen}
        fromRole={currentRole}
        toRole={selectedRole}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmRoleChange}
        isLoading={isLoading}
      />

      {/* Blocked Requirement Dialog (when a requirement fails) */}
      <RoleRequirementBlockedDialog
        isOpen={blockedDialogType !== null}
        type={blockedDialogType ?? 'pending_payment'}
        onClose={() => setBlockedDialogType(null)}
        itemDetail={
          blockedDialogType === 'pending_payment'
            ? roleRequirements.pendingPaymentDetail
            : blockedDialogType === 'pending_deposit'
            ? roleRequirements.pendingDepositDetail
            : undefined
        }
      />
    </>
  );
}
