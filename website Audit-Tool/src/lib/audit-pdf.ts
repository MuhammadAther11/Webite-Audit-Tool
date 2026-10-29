import { jsPDF } from "jspdf";
import type { LiveAudit } from "./pagespeed";
import { reportData } from "./audit-report";
import { LOGO_DATA_URI } from "./audit-logo";

// Standard PDF fonts are Latin-only: preserve readable punctuation without mojibake.
function plain(value: string) {
  return value
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/[`*_]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e\n]/g, " ");
}

function evidence(details: string | null): string[] {
  if (!details) return [];
  try {
    const data = JSON.parse(details) as { items?: unknown[] };
    return (data.items ?? [])
      .slice(0, 4)
      .map((item) => {
        const flatten = (value: unknown, depth = 0): string => {
          if (value == null) return "";
          if (typeof value !== "object") return String(value);
          if (depth > 2) return "";
          return Object.entries(value)
            .map(([key, val]) => `${key}: ${flatten(val, depth + 1)}`)
            .join("; ");
        };
        return flatten(item).slice(0, 700);
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function createAuditPdf(audit: LiveAudit): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const css = getComputedStyle(document.documentElement);
  const color = (role: string) => css.getPropertyValue(`--report-${role}`).trim();
  const ink = color("ink"),
    muted = color("muted"),
    brand = color("brand"),
    paper = color("paper"),
    border = color("border");
  const report = reportData(audit);
  const width = 178,
    left = 16,
    bottom = 274;
  let y = 0;
  const header = () => {
    doc.setFillColor(ink);
    doc.rect(0, 0, 210, 24, "F");
    // Smart Dev Solutions badge: white tile with the logo inside the navy bar.
    doc.setFillColor(paper);
    doc.roundedRect(181, 3, 19, 18, 2, 2, "F");
    try {
      doc.addImage(LOGO_DATA_URI, "JPEG", 182.9, 4.4, 15.2, 15.2);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(ink);
      doc.text("SDS", 187, 13.5);
    }
    doc.setTextColor(paper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("SMART DEV SOLUTIONS", left, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("WEBSITE AUDIT REPORT", left, 19);
    y = 34;
  };
  const space = (height: number) => {
    if (y + height > bottom) {
      doc.addPage();
      header();
    }
  };
  const text = (value: string, size = 10, bold = false, tone = ink) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(plain(value), width) as string[];
    for (const line of lines) {
      space(size * 0.5);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(tone);
      doc.text(line, left, y);
      y += size * 0.5;
    }
    y += 2;
  };
  header();
  text("Website audit", 23, true);
  text(report.url, 11, true, brand);
  if (audit.requestedUrl !== audit.url)
    text(`Requested URL: ${audit.requestedUrl}`, 9, false, muted);
  text(
    `Audited: ${new Date(report.date).toISOString().replace("T", " ").replace(/Z$/, " UTC")}`,
    9,
    false,
    muted,
  );
  text(
    `Strategy: ${audit.strategy} | Google PageSpeed Insights | Lighthouse ${audit.version}`,
    9,
    false,
    muted,
  );
  y += 3;
  space(40);
  const cardWidth = (width - 9) / 4;
  for (const [index, score] of report.scores.entries()) {
    const x = left + index * (cardWidth + 3);
    doc.setDrawColor(border);
    doc.setFillColor(color("surface"));
    doc.roundedRect(x, y, cardWidth, 33, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ink);
    doc.setFontSize(9);
    doc.text(score.label, x + 4, y + 7);
    doc.setFontSize(score.score === null ? 10 : 23);
    doc.setTextColor(
      score.score === null
        ? muted
        : score.score >= 90
          ? brand
          : score.score >= 50
            ? color("medium")
            : color("high"),
    );
    doc.text(score.score === null ? "Unavailable" : `${score.score}`, x + 4, y + 21);
    doc.setFontSize(8);
    doc.setTextColor(muted);
    doc.text(score.score === null ? "Not returned/requested" : "out of 100", x + 4, y + 28);
  }
  y += 43;
  text("Lighthouse lab results", 13, true);
  text(
    "Scores are Google's individual category scores, not a combined average. Lab results represent this audit run and may vary between runs.",
    9,
    false,
    muted,
  );
  text("Real-user field data (CrUX)", 12, true);
  if (!audit.field.length) {
    text(
      "Unavailable in Google's response. No real-user metrics were returned; the scores above are lab measurements, not field data.",
      9,
      false,
      muted,
    );
  } else
    for (const field of audit.field) {
      text(`${field.scope}: ${field.url} | ${field.category}`, 9, true);
      for (const metric of field.metrics)
        text(
          `${metric.name.replaceAll("_", " ")} | 75th percentile: ${metric.percentile ?? "Unavailable"}${metric.name.includes("LAYOUT_SHIFT") ? " (x100)" : metric.name.includes("MS") ? " ms" : ""} | ${metric.category}`,
          8,
          false,
          muted,
        );
    }
  for (const warning of audit.warnings) text(`Run warning: ${warning}`, 9, false, color("medium"));
  y += 3;
  space(30);
  text(`Prioritized findings (${report.issues.length})`, 14, true);
  text(
    "High: failed/low-scoring checks. Medium: partially passing checks. Low: manual review or checks without a score. Priorities are report triage, not Google severity ratings. Evidence shows up to four example items per check; Detailed Issues contains full diagnostics.",
    8,
    false,
    muted,
  );
  if (!report.issues.length)
    text("No failing or manual-review findings were returned for the selected categories.");
  for (const [index, issue] of report.issues.entries()) {
    const items = evidence(issue.details);
    // Keep a finding together if it fits on one page; oversized evidence flows safely.
    const blocks: [string, number, boolean][] = [
      [`${index + 1}. ${issue.title}`, 11, true],
      [
        `${issue.categories.join(" / ")}${issue.mode === "manual" ? " | Manual review required" : ""}`,
        8,
        false,
      ],
      ...(issue.displayValue
        ? [[`Diagnostic: ${issue.displayValue}`, 9, true] as [string, number, boolean]]
        : []),
      ...(issue.description ? [[issue.description, 9, false] as [string, number, boolean]] : []),
      ...issue.warnings.map((warning): [string, number, boolean] => [
        `Warning: ${warning}`,
        8,
        false,
      ]),
      ...(items.length
        ? [
            ["Evidence examples", 8, true] as [string, number, boolean],
            ...items.map((item): [string, number, boolean] => [item, 8, false]),
          ]
        : []),
    ];
    const height = blocks.reduce((sum, [value, size, bold]) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      return sum + (doc.splitTextToSize(plain(value), width) as string[]).length * size * 0.5 + 2;
    }, 18);
    space(Math.min(height, bottom - 34));
    doc.setDrawColor(border);
    doc.line(left, y, left + width, y);
    y += 7;
    const badgeColor = color(issue.priority.toLowerCase());
    doc.setFillColor(badgeColor);
    doc.roundedRect(left, y - 3.5, 19, 6, 1, 1, "F");
    doc.setTextColor(paper);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(issue.priority, left + 3, y + 0.5);
    y += 8;
    text(`${index + 1}. ${issue.title}`, 11, true);
    text(
      `${issue.categories.join(" / ")}${issue.mode === "manual" ? " | Manual review required" : ""}`,
      8,
      false,
      muted,
    );
    if (issue.displayValue) text(`Diagnostic: ${issue.displayValue}`, 9, true);
    if (issue.description) text(issue.description, 9);
    for (const warning of issue.warnings) text(`Warning: ${warning}`, 8, false, muted);
    if (items.length) {
      text("Evidence examples", 8, true, muted);
      for (const item of items) text(item, 8, false, muted);
    }
    y += 3;
  }
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    doc.setDrawColor(border);
    doc.line(left, 281, left + width, 281);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(muted);
    doc.text("Smart Dev Solutions | Google Lighthouse audit", left, 287);
    doc.text(`${page} / ${total}`, left + width, 287, { align: "right" });
  }
  doc.setProperties({
    title: `Website audit - ${audit.url}`,
    author: "Smart Dev Solutions",
    subject: "Google Lighthouse website audit",
    creator: "Smart Dev Website Auditor",
  });
  return doc.output("blob");
}
