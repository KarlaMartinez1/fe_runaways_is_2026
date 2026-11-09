import * as React from 'react';
import Link from 'next/link';
import type { UserProfile } from '@/types/models';
import {
  profileMessages,
  roleDisplayLabels,
  accountStatusDisplayLabels,
} from '@/lib/messages/profile';
import { cn } from '@/lib/utils/cn';

export interface ProfileInfoCardProps {
  profile: UserProfile;
  className?: string;
}

export function ProfileInfoCard({ profile, className }: ProfileInfoCardProps) {
  const initials =
    profile.avatarInitials ||
    profile.fullName
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const isVerified = profile.accountStatus === 'VERIFICADA';
  const isUnverified = profile.accountStatus === 'SIN_VERIFICAR';

  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 shadow-xs',
        className
      )}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <div
          className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-[#DCE7F9] text-lg sm:text-xl font-bold text-[#1E4DB7]"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
            {profile.fullName}
          </h2>
          <p className="truncate text-xs sm:text-sm text-gray-500">
            {profile.email}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center rounded-full bg-[#EAF0FC] px-2.5 py-0.5 text-xs font-semibold text-[#1E4DB7]">
              {roleDisplayLabels[profile.role]}
            </span>

            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                isVerified
                  ? 'bg-[#EAF7EE] text-[#1D8338]'
                  : isUnverified
                  ? 'bg-[#FEF3C7] text-[#92400E]'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {accountStatusDisplayLabels[profile.accountStatus]}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-1 text-xs sm:text-sm text-gray-700 font-medium">
            {profile.ratingCount > 0 ? (
              <>
                <span className="text-amber-500 text-base leading-none" aria-hidden="true">
                  ★
                </span>
                <span>{profile.rating.toFixed(1)}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">
                  {profile.ratingCount} calificaciones
                </span>
              </>
            ) : (
              <span className="text-gray-500">
                {profileMessages.formatRating(profile.rating, profile.ratingCount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details List */}
      <div className="mt-7 divide-y divide-gray-100 border-t border-gray-100 text-xs sm:text-sm">
        <div className="flex items-center justify-between py-3.5">
          <span className="text-gray-500">{profileMessages.fullNameLabel}</span>
          <span className="font-bold text-gray-950 text-right">
            {profile.fullName}
          </span>
        </div>

        <div className="flex items-center justify-between py-3.5">
          <span className="text-gray-500">{profileMessages.emailLabel}</span>
          <span className="font-bold text-gray-950 text-right">
            {profile.email}
          </span>
        </div>

        <div className="flex items-center justify-between py-3.5">
          <span className="text-gray-500">{profileMessages.documentLabel}</span>
          <span className="font-bold text-gray-950 text-right">
            {profileMessages.formatDocument(
              profile.documentType,
              profile.documentNumber
            )}
          </span>
        </div>

        <div className="flex items-center justify-between py-3.5">
          <span className="text-gray-500">{profileMessages.memberSinceLabel}</span>
          <span className="font-bold text-gray-950 text-right">
            {profile.memberSince}
          </span>
        </div>
      </div>

      {/* Button for unverified account */}
      {!isVerified && (
        <div className="mt-6 pt-2">
          <Link
            href="/profile/verification"
            className="block w-full rounded-xl bg-[#1E4DB7] py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-[#163c91] active:scale-[0.99] transition-all shadow-xs"
          >
            {profileMessages.verifyAccountButton}
          </Link>
        </div>
      )}
    </div>
  );
}
