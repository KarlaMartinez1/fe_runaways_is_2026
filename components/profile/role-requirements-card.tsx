import * as React from 'react';
import Link from 'next/link';
import type { RoleRequirements } from '@/types/models';
import { profileMessages } from '@/lib/messages/profile';
import { cn } from '@/lib/utils/cn';

export interface RoleRequirementsCardProps {
  roleRequirements: RoleRequirements;
  className?: string;
}

export function RoleRequirementsCard({
  roleRequirements,
  className,
}: RoleRequirementsCardProps) {
  const unmetReq = roleRequirements.requirements.find((req) => !req.met);

  const getUnmetLink = () => {
    if (!unmetReq) return null;
    if (unmetReq.id === 'noPendingPayments') {
      return {
        href: '/payment',
        label: profileMessages.links.goToPay,
      };
    }
    if (unmetReq.id === 'verifiedAccount') {
      return {
        href: '/profile/verification',
        label: profileMessages.links.verifyAccount,
      };
    }
    if (unmetReq.id === 'noPendingDeposits') {
      return {
        href: '/deposit',
        label: profileMessages.links.goToDeposits,
      };
    }
    return null;
  };

  const unmetLink = getUnmetLink();

  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 shadow-xs',
        className
      )}
    >
      <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-950">
        {profileMessages.requirementsTitle}
      </h2>

      <div className="mt-5 space-y-3.5">
        {roleRequirements.requirements.map((req) => {
          const displayText =
            req.met || !req.unmetLabel ? req.label : req.unmetLabel;

          return (
            <div
              key={req.id}
              className="flex items-center justify-between gap-4 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    req.met ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'truncate font-medium',
                    req.met ? 'text-gray-800' : 'text-gray-900'
                  )}
                >
                  {displayText}
                </span>
              </div>

              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0',
                  req.met
                    ? 'bg-[#EAF7EE] text-[#1D8338]'
                    : 'bg-[#FEECEC] text-[#C53030]'
                )}
              >
                {req.met ? profileMessages.metBadge : profileMessages.pendingBadge}
              </span>
            </div>
          );
        })}
      </div>

      {unmetLink && (
        <div className="mt-5 pt-1">
          <Link
            href={unmetLink.href}
            className="text-xs sm:text-sm font-semibold text-[#1E4DB7] hover:underline inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{unmetLink.label}</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
