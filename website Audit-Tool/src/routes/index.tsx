import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, scoreTone } from "@/components/app/common";
import { demoAudits, demoMonthly, demoStats } from "@/lib/demo-data";
import { Activity, Globe, AlertTriangle, Gauge } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard — Smart Dev Website Auditor" },
      { name: "description", content: "Overview of website audits by Smart Dev Solutions." },
      { property: "og:title", content: "Dashboard — Smart Dev Website Auditor" },
      { property: "og:description", content: "Overview of website audits by Smart Dev Solutions." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    { label: "Total audits", value: demoStats.totalAudits, icon: Activity },
    { label: "Websites analyzed", value: demoStats.websitesAnalyzed, icon: Globe },
    { label: "Average score", value: demoStats.avgScore, icon: Gauge },
    { label: "Open issues", value: demoStats.openIssues, icon: AlertTriangle },
  ];
  return (
    <>
      <PageHeader title="Dashboard" description="Your audit activity at a glance."
        action={<Button asChild><Link to="/new-audit">New audit</Link></Button>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">{s.label}<s.icon className="h-4 w-4 text-primary" /></div>
              <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Audits per month</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoMonthly}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={24} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="audits" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Recent audits</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Website</TableHead><TableHead>Date</TableHead><TableHead>Score</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {demoAudits.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><div className="font-medium">{a.client}</div><div className="text-xs text-muted-foreground">{a.url}</div></TableCell>
                    <TableCell className="text-sm">{a.date}</TableCell>
                    <TableCell className={`font-semibold ${scoreTone(a.score)}`}>{a.score}</TableCell>
                    <TableCell><Badge variant={a.status === "Completed" ? "secondary" : "outline"}>{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
