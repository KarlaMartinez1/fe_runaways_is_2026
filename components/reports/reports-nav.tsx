'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { reportMessages } from "@/lib/messages/reports";

export type ReportTabKey = "income" | "ratings" | "occupancy";

export interface ReportTabItem {
  key: ReportTabKey;
  label: string;
  href: string;
}

export interface ReportsNavProps {
  className?: string;
}

const reportTabs: ReportTabItem[] = [
  {
    key: "income",
    label: reportMessages.tabs.income,
    href: "/owner/reports",
  },
  {
    key: "ratings",
    label: reportMessages.tabs.ratings,
    href: "/owner/reports/ratings",
  },
  {
    key: "occupancy",
    label: reportMessages.tabs.occupancy,
    href: "/owner/reports/occupancy",
  },
];

export function ReportsNav({ className }: ReportsNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Subnavegación de reportes"
      className={cn("flex items-center gap-6 sm:gap-8 border-b border-zinc-200", className)}
    >
      {reportTabs.map((tab) => {
        const isActive =
          tab.href === "/owner/reports"
            ? pathname === "/owner/reports"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "pb-3 text-sm font-medium transition-colors select-none",
              isActive
                ? "border-b-2 border-[#1E4DB7] text-[#1E4DB7] font-semibold"
                : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
