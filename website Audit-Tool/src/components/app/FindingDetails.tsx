import type { Finding } from "@/lib/pagespeed";

function cell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    return typeof v['snippet'] === "string" ? v['snippet'] : typeof v['url'] === "string" ? v['url'] : JSON.stringify(value);
  }
  return String(value);
}
export function FindingDetails({ finding }: { finding: Finding }) {
  const details = finding.details ? JSON.parse(finding.details) as Record<string, unknown> : null;
  const items = Array.isArray(details?.['items']) ? details['items'] : [];
  const headings = Array.isArray(details?.['headings']) ? details['headings'] as Record<string, unknown>[] : [];
  return <div className="space-y-3 text-sm">
    <p className="break-words">{finding.description || "No recommendation provided by Lighthouse."}</p>
    {finding.displayValue && <p className="font-medium">{finding.displayValue}</p>}
    {finding.warnings.map((w, index) => <p key={index} className="text-warning-foreground">{w}</p>)}
    {items.length > 0 && <div className="overflow-x-auto rounded border bg-muted/30">
      {headings.length > 0 ? <table className="w-full text-left text-xs"><thead><tr>{headings.map((h, i) => <th key={i} className="p-2">{cell(h['label'] ?? h['key'])}</th>)}</tr></thead>
        <tbody>{items.slice(0, 30).map((item, i) => <tr key={i} className="border-t">{headings.map((h, j) => <td key={j} className="max-w-xs break-words p-2">{cell(typeof item === "object" && item !== null ? (item as Record<string, unknown>)[String(h['key'])] : item)}</td>)}</tr>)}</tbody></table>
        : <pre className="whitespace-pre-wrap break-all p-3 text-xs">{JSON.stringify(items.slice(0, 30), null, 2)}</pre>}
      {items.length > 30 && <p className="p-2 text-xs text-muted-foreground">Showing 30 of {items.length} evidence rows.</p>}
    </div>}
  </div>;
}