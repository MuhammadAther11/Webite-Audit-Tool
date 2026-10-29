import { describe, expect, it } from "vitest";
import { reportData, reportFilename, reportPriority } from "@/lib/audit-report";
import type { Finding, LiveAudit } from "@/lib/pagespeed";

const finding: Finding = {
  id: "lcp",
  title: "Slow loading",
  description: "Reduce load time.",
  score: 0.3,
  mode: "numeric",
  displayValue: "4.2 s",
  categories: ["Performance"],
  warnings: [],
  details: null,
};
const audit: LiveAudit = {
  url: "https://example.com/",
  requestedUrl: "https://example.com/",
  date: "2026-10-25T11:00:00Z",
  strategy: "mobile",
  version: "13",
  warnings: [],
  categories: [{ id: "performance", category: "Performance", score: 87, findings: [finding] }],
  findings: [finding],
  field: [],
};

describe("PDF report data", () => {
  it("keeps real scores and leaves missing categories unavailable", () => {
    expect(reportData(audit).scores.map((score) => score.score)).toEqual([87, null, null, null]);
  });
  it("preserves the website, timestamp, and Google's recommendations", () => {
    const report = reportData(audit);
    expect(report.url).toBe("https://example.com/");
    expect(report.date).toBe("2026-10-25T11:00:00Z");
    expect(report.issues[0]?.description).toBe("Reduce load time.");
  });
  it("supports High, Medium and Low report priorities without calling passes issues", () => {
    expect(reportPriority(finding)).toBe("High");
    expect(reportPriority({ ...finding, score: 0.7 })).toBe("Medium");
    expect(reportPriority({ ...finding, score: null, mode: "manual" })).toBe("Low");
    expect(reportData({ ...audit, findings: [{ ...finding, score: 1 }] }).issues).toEqual([]);
  });
  it("names the report for the website, strategy and audit date", () => {
    expect(reportFilename(audit)).toBe("smart-dev-audit-example.com-mobile-2026-10-25.pdf");
  });
});
