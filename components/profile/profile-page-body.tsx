'use client';

import * as React from 'react';
import type { UserProfile, RoleRequirements, UserRole } from '@/types/models';
import { profileMessages, roleDisplayLabels } from '@/lib/messages/profile';
import { ProfileInfoCard } from './profile-info-card';
import { RoleManagementCard } from './role-management-card';
import { RoleRequirementsCard } from './role-requirements-card';

export interface ProfilePageBodyProps {
  initialProfile: UserProfile;
  roleRequirements: RoleRequirements;
  onUpdateRole?: (newRole: UserRole) => Promise<{ success: boolean; message?: string }>;
}

export function ProfilePageBody({
  initialProfile,
  roleRequirements,
  onUpdateRole,
}: ProfilePageBodyProps) {
  const [profile, setProfile] = React.useState<UserProfile>(initialProfile);
  const [isLoading, setIsLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleRoleChange = async (newRole: UserRole) => {
    setIsLoading(true);
    setNotice(null);

    try {
      if (onUpdateRole) {
        const result = await onUpdateRole(newRole);
        if (!result.success) {
          setNotice({
            type: 'error',
            text: result.message || profileMessages.roleChangeError,
          });
          setIsLoading(false);
          return;
        }
      }

      // Optimistic or confirmed local update
      setProfile((prev) => ({
        ...prev,
        role: newRole,
      }));

      setNotice({
        type: 'success',
        text: profileMessages.roleChangeSuccess(roleDisplayLabels[newRole]),
      });
    } catch {
      setNotice({
        type: 'error',
        text: profileMessages.roleChangeError,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
            {profileMessages.pageTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {profileMessages.pageSubtitle}
          </p>
        </header>

        {notice && (
          <div
            role="alert"
            className={`mb-6 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              notice.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="ml-4 text-xs font-semibold underline opacity-75 hover:opacity-100 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section
            aria-label={profileMessages.pageTitle}
            className="lg:col-span-6 w-full"
          >
            <ProfileInfoCard profile={profile} />
          </section>

          <section
            aria-label={profileMessages.roleCardTitle}
            className="lg:col-span-6 w-full space-y-6"
          >
            <RoleManagementCard
              currentRole={profile.role}
              accountStatus={profile.accountStatus}
              roleRequirements={roleRequirements}
              onRoleChange={handleRoleChange}
              isLoading={isLoading}
            />

            <RoleRequirementsCard roleRequirements={roleRequirements} />
          </section>
        </div>
      </div>
    </main>
  );
}
