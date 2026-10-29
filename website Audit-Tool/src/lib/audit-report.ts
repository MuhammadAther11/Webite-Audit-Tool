import { categoryNames, isFinding, type Finding, type LiveAudit } from "./pagespeed";

export type ReportPriority = "High" | "Medium" | "Low";
// Report priorities are editorial triage, not a severity supplied by Google.
export function reportPriority(finding: Finding): ReportPriority {
  if (finding.mode === "manual" || finding.score === null) return "Low";
  return finding.score < 0.5 ? "High" : "Medium";
}

export function reportData(audit: LiveAudit) {
  const order: Record<ReportPriority, number> = { High: 0, Medium: 1, Low: 2 };
  return {
    url: audit.url,
    date: audit.date,
    scores: Object.entries(categoryNames).map(([id, label]) => ({
      label,
      score: audit.categories.find((category) => category.id === id)?.score ?? null,
    })),
    issues: audit.findings
      .filter(isFinding)
      .map((finding) => ({
        ...finding,
        priority: reportPriority(finding),
      }))
      .sort((a, b) => order[a.priority] - order[b.priority]),
  };
}

export function reportFilename(audit: LiveAudit) {
  const host = new URL(audit.url).hostname.replace(/[^a-z0-9.-]/gi, "-");
  return `smart-dev-audit-${host}-${audit.strategy}-${audit.date.slice(0, 10)}.pdf`;
}
