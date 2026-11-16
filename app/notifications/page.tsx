import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { NotificationsPageBody } from "@/components/notifications";
import { notificationRepository, profileRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";
import { notificationMessages } from "@/lib/messages/notifications";
import type { NotificationListResult } from "@/lib/repositories/notification-repository";

export const metadata: Metadata = {
  title: "Notificaciones | Runaways",
  description: "Bandeja de notificaciones del usuario.",
};

interface NotificationsPageProps {
  searchParams?: Promise<{
    page?: string;
    scenario?: string;
    bypass?: string;
    dev?: string;
  }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const scenario = resolvedParams.scenario || undefined;
  const isBypass =
    resolvedParams.bypass === "true" ||
    resolvedParams.dev === "true" ||
    Boolean(scenario);

  let forbidden = false;

  // Validación de acceso (Roles permitidos: TENANT, OWNER, ADMIN)
  if (!isBypass) {
    try {
      const profile = await profileRepository.getUserProfile(scenario);
      if (
        !profile ||
        (profile.role !== "TENANT" &&
          profile.role !== "OWNER" &&
          profile.role !== "ADMIN")
      ) {
        forbidden = true;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          redirect("/login");
        }
        if (error.status === 403) {
          forbidden = true;
        }
      }
      if (process.env.USE_MOCKS !== "true") {
        console.error("Error al validar perfil para notificaciones:", error);
      }
    }
  }

  if (forbidden) {
    return (
      <>
        <Navbar />
        <main className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            {notificationMessages.forbidden}
          </h1>
        </main>
      </>
    );
  }

  let result: NotificationListResult;
  try {
    result = await notificationRepository.list({ page, pageSize: 10 });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    // Fallback seguro en caso de error
    result = {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      unreadCount: 0,
    };
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)] bg-zinc-50/40">
        <NotificationsPageBody initialData={result} />
      </main>
    </>
  );
}
