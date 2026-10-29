import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveAudit } from "@/lib/pagespeed";
import { reportFilename } from "@/lib/audit-report";
import { deliverFile } from "@/lib/download";

export function PdfReportButton({ audit }: { audit: LiveAudit }) {
  const [prepared, setPrepared] = useState<{ audit: LiveAudit; blob: Blob } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setError("");
    void import("@/lib/audit-pdf")
      .then(({ createAuditPdf }) => {
        const blob = createAuditPdf(audit);
        if (!cancelled) setPrepared({ audit, blob });
      })
      .catch(() => {
        if (!cancelled) setError("The PDF could not be prepared. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [audit, attempt]);
  const ready = prepared?.audit === audit;
  return (
    <div className="flex max-w-full flex-col items-start gap-2">
      <Button
        disabled={!ready && !error}
        onClick={() => {
          if (error) {
            setAttempt((value) => value + 1);
            return;
          }
          if (prepared?.audit !== audit) return;
          void deliverFile(prepared.blob, reportFilename(audit)).catch(() =>
            setError("The PDF could not be downloaded. Please try again."),
          );
        }}
      >
        {error ? (
          <RefreshCw className="h-4 w-4" />
        ) : ready ? (
          <Download className="h-4 w-4" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
        )}
        {error ? "Retry PDF Report" : ready ? "Download PDF Report" : "Preparing PDF…"}
      </Button>
      {error && (
        <p role="alert" className="max-w-xs text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
