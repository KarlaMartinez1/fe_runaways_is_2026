"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Role } from "@/lib/auth/roles";

export type SessionStatus = "loading" | "authenticated" | "anonymous";
export type SessionUser = { id: string; email: string; role: Role; isActive: boolean };
export type SessionState = { user: SessionUser | null; status: SessionStatus };
const SessionContext = createContext<SessionState>({ user: null, status: "loading" });

export function SessionProvider({ user, children }: { user: SessionUser | null; children: React.ReactNode }) {
  const [state] = useState<SessionState>(() => ({ user, status: user ? "authenticated" : "anonymous" }));
  const value = useMemo(() => state, [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionStore() { return useContext(SessionContext); }
