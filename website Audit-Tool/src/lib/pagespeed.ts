import { z } from "zod";

export const categoryNames = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
} as const;
export type AuditCategory = keyof typeof categoryNames;
export const auditInput = z.object({
  url: z.string().trim().max(2048).url().refine((value) => {
    try {
      const u = new URL(value);
      return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password;
    } catch { return false; }
  }, "Enter a full public HTTP or HTTPS URL."),
  strategy: z.enum(["desktop", "mobile"]),
  categories: z.array(z.enum(["performance", "accessibility", "best-practices", "seo"])).min(1).max(4),
});
export type AuditInput = z.infer<typeof auditInput>;

const lighthouseAudit = z.object({
  id: z.string().optional(), title: z.string().optional(), description: z.string().optional(),
  score: z.number().nullable().optional(), scoreDisplayMode: z.string().optional(),
  displayValue: z.string().optional(), errorMessage: z.string().optional(),
  warnings: z.array(z.string()).optional(), details: z.record(z.unknown()).optional(),
});
const fieldSchema = z.object({
  id: z.string().optional(), overall_category: z.string().optional(),
  metrics: z.record(z.object({ percentile: z.number().optional(), category: z.string().optional() })).optional(),
}).passthrough();
const responseSchema = z.object({
  lighthouseResult: z.object({
    requestedUrl: z.string().optional(), finalUrl: z.string(), fetchTime: z.string(),
    lighthouseVersion: z.string().optional(), runWarnings: z.array(z.string()).optional(),
    runtimeError: z.object({ message: z.string().optional() }).optional(),
    categories: z.record(z.object({ score: z.number().nullable().optional(), auditRefs: z.array(z.object({ id: z.string() })).optional() })),
    audits: z.record(lighthouseAudit),
  }),
  loadingExperience: fieldSchema.optional(), originLoadingExperience: fieldSchema.optional(),
});
export type Finding = {
  id: string; title: string; description: string; score: number | null;
  mode: string; displayValue: string; categories: string[]; warnings: string[];
  details: string | null;
};
export type LiveAudit = {
  url: string; requestedUrl: string; date: string; strategy: AuditInput["strategy"];
  version: string; warnings: string[];
  categories: { id: AuditCategory; category: string; score: number | null; findings: Finding[] }[];
  findings: Finding[];
  field: { scope: "Page" | "Origin"; url: string; category: string; metrics: { name: string; percentile: number | null; category: string }[] }[];
};
export function isFinding(a: Finding) {
  return (a.score !== null && a.score < 1) || ["manual", "error"].includes(a.mode);
}
export function normalizePageSpeed(raw: unknown, input: AuditInput): LiveAudit {
  const parsed = responseSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Google returned incomplete Lighthouse results. Please try again.");
  const p = parsed.data, l = p.lighthouseResult;
  if (l.runtimeError) throw new Error("Google could not load this website for Lighthouse. Check that it is publicly accessible and try again.");
  const findings: Finding[] = Object.entries(l.audits).map(([id, a]) => ({
    id, title: a.title ?? id, description: a.description ?? "", score: a.score ?? null,
    mode: a.scoreDisplayMode ?? "informative", displayValue: a.errorMessage ?? a.displayValue ?? "",
    warnings: a.warnings ?? [], details: a.details ? JSON.stringify(a.details) : null,
    categories: input.categories.filter((c) => l.categories[c]?.auditRefs?.some((ref) => ref.id === id)).map((c) => categoryNames[c]),
  })).filter((a) => a.categories.length > 0);
  const categories = input.categories.map((id) => {
    const score = l.categories[id]?.score;
    return { id, category: categoryNames[id], score: typeof score === "number" ? Math.round(score * 100) : null,
      findings: findings.filter((a) => a.categories.includes(categoryNames[id])) };
  });
  if (!categories.some((c) => c.score !== null)) throw new Error("Google returned no Lighthouse scores. Please try again.");
  const field: LiveAudit["field"] = [];
  for (const [scope, experience] of [["Page", p.loadingExperience], ["Origin", p.originLoadingExperience]] as const) {
    const metrics = Object.entries(experience?.metrics ?? {}).map(([name, m]) => ({ name, percentile: m.percentile ?? null, category: m.category ?? "Unavailable" }));
    if (metrics.length) field.push({ scope, url: experience?.id ?? "", category: experience?.overall_category ?? "Unavailable", metrics });
  }
  return { url: l.finalUrl, requestedUrl: l.requestedUrl ?? input.url, date: l.fetchTime, strategy: input.strategy,
    version: l.lighthouseVersion ?? "", warnings: l.runWarnings ?? [], categories, findings, field };
}

export function providerError(status: number): string {
  if (status === 429) return "Google's PageSpeed quota is exhausted. Try again later or check the API project's quota in Google Cloud Console.";
  if (status === 401 || status === 403) return "Google denied this audit. Check that the saved API key has PageSpeed Insights API enabled and permits this API.";
  if (status === 400) return "Google could not audit this URL. Check that the website is publicly accessible and the address is correct.";
  return "Google PageSpeed Insights is temporarily unavailable. Please try again later.";
}