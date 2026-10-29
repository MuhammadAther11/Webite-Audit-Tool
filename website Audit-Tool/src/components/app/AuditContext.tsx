import { createContext, useContext, useState, type ReactNode } from "react";
import type { LiveAudit } from "@/lib/pagespeed";

const AuditContext = createContext<{ audit: LiveAudit | null; setAudit: (audit: LiveAudit | null) => void } | null>(null);
export function AuditProvider({ children }: { children: ReactNode }) {
  const [audit, setAudit] = useState<LiveAudit | null>(null);
  return <AuditContext.Provider value={{ audit, setAudit }}>{children}</AuditContext.Provider>;
}
export function useAudit() {
  const value = useContext(AuditContext);
  if (!value) throw new Error("AuditProvider is required");
  return value;
}