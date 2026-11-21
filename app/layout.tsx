import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentUser } from "@/lib/api/auth";
import { SessionProvider } from "@/lib/stores/session-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SI Boilerplate",
  icons: { icon: "/icon-runaways.svg" },
  description: "Boilerplate con login básico",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider user={user}>{children}</SessionProvider>
      </body>
    </html>
  );
}
