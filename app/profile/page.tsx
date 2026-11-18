import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ProfilePageBody } from "@/components/profile/profile-page-body";
import { profileRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";
import { createSession } from "@/lib/session";
import { profileMessages } from "@/lib/messages/profile";
import type { UserProfile, UserRole } from "@/types/models";

export const metadata: Metadata = {
  title: "Mi perfil | Runaways",
  description: "Administra tu información personal y el rol de tu cuenta.",
};

interface ProfilePageProps {
  searchParams?: Promise<{ scenario?: string }>;
}

async function updateRoleAction(newRole: UserRole) {
  "use server";
  try {
    const res = await profileRepository.changeRole(newRole);

    if (res.success) {
      if (res.accessToken) {
        await createSession(
          res.accessToken,
          res.expiresIn ?? 900,
          res.refreshToken ?? ""
        );
      }
      return {
        success: true,
        newRole: res.newRole,
        message: res.message,
      };
    }

    return {
      success: false,
      code: res.code,
      message: res.message,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    return {
      success: false,
      message:
        err instanceof Error ? err.message : profileMessages.backendErrors.DEFAULT,
    };
  }
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { scenario } = resolvedSearchParams;

  let profile: UserProfile | null = null;
  let unauthorized = false;

  try {
    profile = await profileRepository.getUserProfile(scenario);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error("Error al cargar el perfil de usuario:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-xs border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {profileMessages.loadErrorTitle}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {profileMessages.loadErrorMessage}
            </p>
            <Link
              href="/profile"
              className="inline-flex rounded-xl bg-[#1E4DB7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163c91]"
            >
              {profileMessages.retryButton}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Navbar />
      <ProfilePageBody
        initialProfile={profile}
        onUpdateRole={updateRoleAction}
      />
    </div>
  );
}
