import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, ScoreRing } from "@/components/app/common";
import { useAudit } from "@/components/app/AuditContext";
import { isFinding } from "@/lib/pagespeed";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { PdfReportButton } from "@/components/app/PdfReportButton";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Audit Results — Smart Dev Website Auditor" },
      {
        name: "description",
        content:
          "Real Google Lighthouse performance, accessibility, best practices and SEO results.",
      },
      { property: "og:title", content: "Audit Results — Smart Dev Website Auditor" },
      {
        property: "og:description",
        content:
          "Real Google Lighthouse performance, accessibility, best practices and SEO results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Results,
});
function Results() {
  const { audit } = useAudit();
  if (!audit)
    return (
      <>
        <PageHeader title="Audit Results" />
        <p className="mb-4 text-muted-foreground">
          No live audit in this session. Run an audit to see Google’s results.
        </p>
        <Button asChild>
          <Link to="/new-audit">New audit</Link>
        </Button>
      </>
    );
  const performance = audit.categories.find((c) => c.id === "performance");
  const chartData = audit.categories.filter((c) => c.score !== null);
  return (
    <>
      <PageHeader
        title="Audit Results"
        description={`${audit.url} · ${audit.strategy} · ${new Date(audit.date).toLocaleString()}`}
        action={
          <div className="flex flex-wrap items-start gap-2">
            <Button asChild variant="outline">
              <Link to="/issues">View all issues</Link>
            </Button>
            <PdfReportButton audit={audit} />
          </div>
        }
      />
      <div className="mb-6 rounded-md border bg-accent p-3 text-sm text-accent-foreground">
        Google PageSpeed Insights · Lighthouse {audit.version} lab results ·{" "}
        {audit.strategy === "mobile" ? "Mobile" : "Desktop"}
      </div>
      {audit.warnings.map((w, i) => (
        <p key={i} className="mb-3 text-sm text-warning-foreground">
          {w}
        </p>
      ))}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            {performance?.score != null ? (
              <ScoreRing score={performance.score} size={120} />
            ) : (
              <p className="text-muted-foreground">Not available / not requested</p>
            )}
            <div className="h-48 w-full">
              <ResponsiveContainer>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="category" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {audit.categories.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{r.category}</h3>
                  {r.score !== null ? (
                    <ScoreRing score={r.score} size={52} />
                  ) : (
                    <span className="text-xs text-muted-foreground">Unavailable</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {[...r.findings]
                    .sort((a, b) => Number(isFinding(b)) - Number(isFinding(a)))
                    .slice(0, 5)
                    .map((c) => (
                      <li key={c.id} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 shrink-0">
                          {c.score === 1 ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : c.score === 0 ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          )}
                        </span>
                        <span className="min-w-0 break-words">
                          <span className="font-medium">{c.title}</span>
                          {c.displayValue && (
                            <span className="text-muted-foreground"> — {c.displayValue}</span>
                          )}
                          {c.mode === "manual" && (
                            <span className="text-muted-foreground"> — Manual review</span>
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
                {r.findings.length > 5 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {r.findings.length} Lighthouse checks · full findings in Detailed Issues
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <section className="mt-6 border-t pt-5">
        <h2 className="mb-2 text-lg font-semibold">Real-user field data (CrUX)</h2>
        {audit.field.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Unavailable in Google’s response. No real-user metrics were returned; the scores above
            are Lighthouse lab results, not field measurements.
          </p>
        ) : (
          audit.field.map((f) => (
            <div key={f.scope} className="mb-4">
              <h3 className="font-medium">
                {f.scope} · {f.category}
              </h3>
              <p className="break-all text-xs text-muted-foreground">{f.url}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {f.metrics.map((m) => (
                  <li key={m.name}>
                    {m.name.replaceAll("_", " ")} · 75th percentile: {m.percentile ?? "Unavailable"}
                    {m.name.includes("LAYOUT_SHIFT") && m.percentile !== null
                      ? " (×100)"
                      : m.name.includes("MS")
                        ? " ms"
                        : ""}{" "}
                    · {m.category}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}
