import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/app/common";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Settings — Smart Dev Website Auditor" },
      { name: "description", content: "Branding and report settings for Smart Dev Solutions." },
      { property: "og:title", content: "Settings — Smart Dev Website Auditor" },
      { property: "og:description", content: "Branding and report settings for Smart Dev Solutions." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Branding shown on your client reports." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Company branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sidebar font-display text-lg font-bold text-sidebar-primary">SD</div>
              <Button variant="outline" size="sm" disabled>Upload logo (coming soon)</Button>
            </div>
            <Field id="company" label="Company name" value="Smart Dev Solutions" />
            <Field id="tagline" label="Report tagline" value="Professional website audits" />
            <Field id="email" label="Contact email" value="" placeholder="you@yourcompany.com" />
            <Field id="site" label="Website" value="" placeholder="https://yourcompany.com" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Report preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {["Include company logo on PDF", "Show executive summary", "Include low-severity issues"].map((l) => (
              <label key={l} className="flex items-center justify-between text-sm">{l}<Switch defaultChecked /></label>
            ))}
            <Button onClick={() => toast.info("Settings are not saved yet", { description: "Saving will work once a database is connected." })}>Save settings</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ id, label, value, placeholder }: { id: string; label: string; value: string; placeholder?: string }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} defaultValue={value} placeholder={placeholder} /></div>;
}
