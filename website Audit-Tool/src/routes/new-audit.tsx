import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/app/common";
import { useAudit } from "@/components/app/AuditContext";
import { auditInput, categoryNames, type AuditCategory, type LiveAudit } from "@/lib/pagespeed";
import { runPageSpeed } from "@/lib/pagespeed.functions";
import { Info, Loader2, Monitor, Smartphone } from "lucide-react";

export const Route = createFileRoute("/new-audit")({
  head: () => ({
    meta: [
      { title: "New Audit — Smart Dev Website Auditor" },
      {
        name: "description",
        content: "Run a real Google PageSpeed Insights website audit on desktop or mobile.",
      },
      { property: "og:title", content: "New Audit — Smart Dev Website Auditor" },
      {
        property: "og:description",
        content: "Run a real Google PageSpeed Insights website audit on desktop or mobile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewAudit,
});
function NewAudit() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<"desktop" | "mobile">("desktop");
  const [categories, setCategories] = useState<AuditCategory[]>([
    "performance",
    "accessibility",
    "best-practices",
    "seo",
  ]);
  const { setAudit } = useAudit();
  const run = useServerFn(runPageSpeed);
  const navigate = useNavigate();
  async function runAudit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const parsed = auditInput.safeParse({ url, strategy, categories });
    if (!parsed.success) {
      setError(
        categories.length
          ? "Enter a full HTTP or HTTPS URL, e.g. https://example.com"
          : "Select at least one category.",
      );
      return;
    }
    setError("");
    setLoading(true);
    setAudit(null);
    try {
      const result = (await run({ data: parsed.data })) as {
        audit: LiveAudit | null;
        error: string | null;
      };
      if (!result.audit) {
        setError(result.error ?? "The audit failed. Please try again.");
        return;
      }
      setAudit(result.audit);
      await navigate({ to: "/results" });
    } catch {
      setError("The audit could not finish. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <PageHeader title="New Audit" description="Enter a client website to audit." />
      <Card className="max-w-2xl">
        <CardContent className="space-y-6 p-6">
          <form onSubmit={runAudit} className="space-y-6" aria-busy={loading}>
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  disabled={loading}
                  aria-invalid={!!error}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                />
                <Button type="submit" disabled={loading}>
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                  )}
                  {loading ? "Auditing…" : "Run Audit"}
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {loading && (
                <p role="status" className="text-sm text-muted-foreground">
                  Google is running Lighthouse on {strategy}. This may take up to two minutes.
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label>Audit strategy</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={loading}
                  variant={strategy === "desktop" ? "default" : "outline"}
                  aria-pressed={strategy === "desktop"}
                  onClick={() => setStrategy("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                  Desktop
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  variant={strategy === "mobile" ? "default" : "outline"}
                  aria-pressed={strategy === "mobile"}
                  onClick={() => setStrategy("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Checks to include</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(categoryNames) as AuditCategory[]).map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      disabled={loading}
                      checked={categories.includes(c)}
                      onCheckedChange={(checked) =>
                        setCategories((previous) =>
                          checked === true ? [...previous, c] : previous.filter((v) => v !== c),
                        )
                      }
                    />
                    {categoryNames[c]}
                  </label>
                ))}
              </div>
            </div>
          </form>
          <div className="flex gap-2 rounded-md bg-accent p-3 text-sm text-accent-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Google PageSpeed Insights · Lighthouse lab results. Real-user field data is shown only
            when returned by Google.
          </div>
        </CardContent>
      </Card>
    </>
  );
}
