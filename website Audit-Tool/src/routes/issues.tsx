import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/app/common";
import { useAudit } from "@/components/app/AuditContext";
import { FindingDetails } from "@/components/app/FindingDetails";
import { isFinding } from "@/lib/pagespeed";

export const Route = createFileRoute("/issues")({
  head: () => ({ meta: [
    { title: "Detailed Issues — Smart Dev Website Auditor" },
    { name: "description", content: "Actual Google Lighthouse findings, evidence and recommendations." },
    { property: "og:title", content: "Detailed Issues — Smart Dev Website Auditor" },
    { property: "og:description", content: "Actual Google Lighthouse findings, evidence and recommendations." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Issues,
});
function Issues() {
  const { audit } = useAudit();
  const [filter, setFilter] = useState("findings");
  if (!audit) return <><PageHeader title="Detailed Issues" /><p className="mb-4 text-muted-foreground">No live audit in this session.</p><Button asChild><Link to="/new-audit">New audit</Link></Button></>;
  const list = audit.findings.filter((i) => filter === "all" || (filter === "findings" ? isFinding(i) : i.categories.includes(filter)));
  const options = [{ id: "findings", label: "Findings", count: audit.findings.filter(isFinding).length }, { id: "all", label: "All checks", count: audit.findings.length }, ...audit.categories.map((c) => ({ id: c.category, label: c.category, count: c.findings.length }))];
  return <>
    <PageHeader title="Detailed Issues" description={`${audit.url} · ${audit.strategy} · Google Lighthouse findings`} />
    <div className="mb-4 flex flex-wrap gap-2">{options.map((s) => <Button key={s.id} size="sm" variant={filter === s.id ? "default" : "outline"} onClick={() => setFilter(s.id)}>{s.label} ({s.count})</Button>)}</div>
    <Card><CardContent className="p-2 sm:p-4"><Accordion type="multiple">{list.map((i) => <AccordionItem key={i.id} value={i.id}>
      <AccordionTrigger className="text-left hover:no-underline"><div className="flex flex-wrap items-center gap-3">
        <Badge variant={i.score === 0 ? "destructive" : "secondary"}>{i.mode === "manual" ? "Manual review" : i.mode === "error" ? "Unavailable" : i.score === 1 ? "Pass" : i.score === null ? "Informational" : "Needs attention"}</Badge>
        <span className="font-medium">{i.title}</span><span className="text-xs text-muted-foreground">{i.categories.join(" · ")}</span>
      </div></AccordionTrigger><AccordionContent><FindingDetails finding={i} /></AccordionContent>
    </AccordionItem>)}</Accordion>{list.length === 0 && <p className="p-4 text-sm text-muted-foreground">No findings in this view.</p>}</CardContent></Card>
  </>;
}
