import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/demo-data";
import { FlaskConical } from "lucide-react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function DemoBanner({ text = "Demo data — these results are sample values, not a live audit." }: { text?: string }) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-md border border-warning/50 bg-warning/10 px-4 py-2.5 text-sm text-warning-foreground">
      <FlaskConical className="h-4 w-4 shrink-0" /> {text}
    </div>
  );
}

const sevStyles: Record<Severity, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-destructive/15 text-destructive",
  medium: "bg-warning/20 text-warning-foreground",
  low: "bg-info/15 text-info",
};
export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge className={cn("border-0 capitalize", sevStyles[severity])}>{severity}</Badge>;
}

export function scoreTone(score: number) {
  return score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
}

export function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={scoreTone(score)}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 32 32)" />
      <text x="32" y="37" textAnchor="middle" className="fill-foreground font-display text-[15px] font-bold">{score}</text>
    </svg>
  );
}
