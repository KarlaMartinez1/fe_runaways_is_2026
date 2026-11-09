import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ProfilePageBody } from "@/components/profile/profile-page-body";
import { profileRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";
import type { UserProfile, RoleRequirements, UserRole } from "@/types/models";

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
    return { success: res.success, message: res.message };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : undefined,
    };
  }
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { scenario } = resolvedSearchParams;

  let profile: UserProfile | null = null;
  let requirements: RoleRequirements | null = null;
  let unauthorized = false;

  try {
    [profile, requirements] = await Promise.all([
      profileRepository.getUserProfile(scenario),
      profileRepository.getRoleRequirements(scenario),
    ]);
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

  if (!profile || !requirements) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Navbar />
      <ProfilePageBody
        initialProfile={profile}
        roleRequirements={requirements}
        onUpdateRole={updateRoleAction}
      />
    </div>
  );
}
