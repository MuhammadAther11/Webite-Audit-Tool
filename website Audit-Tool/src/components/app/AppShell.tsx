import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, PlusCircle, Gauge, ListChecks, FileText, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new-audit", label: "New Audit", icon: PlusCircle },
  { to: "/results", label: "Audit Results", icon: Gauge },
  { to: "/issues", label: "Detailed Issues", icon: ListChecks },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary font-display font-bold text-sidebar-primary-foreground">SD</div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-sidebar-accent-foreground">Website Auditor</div>
            <div className="text-xs opacity-70">Smart Dev Solutions</div>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
                <n.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-md border border-sidebar-border p-3 text-xs opacity-80">
          Audits powered by Google PageSpeed Insights. Reports show labeled samples.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <span className="font-display font-semibold">Smart Dev Website Auditor</span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
