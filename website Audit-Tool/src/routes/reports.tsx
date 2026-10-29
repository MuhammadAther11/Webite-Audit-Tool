import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DemoBanner, PageHeader, scoreTone } from "@/components/app/common";
import { demoAudits } from "@/lib/demo-data";
import { Download } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Reports — Smart Dev Website Auditor" },
      { name: "description", content: "Client-ready website audit reports." },
      { property: "og:title", content: "Reports — Smart Dev Website Auditor" },
      { property: "og:description", content: "Client-ready website audit reports." },
    ],
  }),
  component: Reports,
});

// TODO: replace with real PDF generation later.
function exportPdf(client: string) {
  toast.info(`PDF export for ${client} is coming soon`, { description: "PDF generation is not connected yet." });
}

function Reports() {
  return (
    <>
      <PageHeader title="Reports" description="Sample audit reports ready to share with clients." />
      <DemoBanner text="Demo data — these are sample reports. PDF export is a placeholder." />
      <Card>
        <CardContent className="overflow-x-auto p-4">
          <Table>
            <TableHeader><TableRow><TableHead>Report</TableHead><TableHead>Date</TableHead><TableHead>Score</TableHead><TableHead>Issues</TableHead><TableHead className="text-right">Export</TableHead></TableRow></TableHeader>
            <TableBody>
              {demoAudits.map((a) => (
                <TableRow key={a.id}>
                  <TableCell><div className="font-medium">{a.client} — Website Audit</div><div className="text-xs text-muted-foreground">{a.id} · {a.url}</div></TableCell>
                  <TableCell className="text-sm">{a.date}</TableCell>
                  <TableCell className={`font-semibold ${scoreTone(a.score)}`}>{a.score}</TableCell>
                  <TableCell>{a.issues}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => exportPdf(a.client)}><Download className="h-4 w-4" /> PDF</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
