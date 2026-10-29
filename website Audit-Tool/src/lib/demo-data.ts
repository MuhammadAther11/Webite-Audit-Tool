// DEMO DATA ONLY — replace with real audit API / database calls later.
// Keep the shapes below as the contract for future integrations.

export type Severity = "critical" | "high" | "medium" | "low";
export type Category = "SEO" | "Performance" | "Accessibility" | "Mobile" | "Security";

export interface AuditSummary {
  id: string;
  url: string;
  client: string;
  date: string;
  score: number;
  status: "Completed" | "Draft";
  issues: number;
}

export interface CategoryResult {
  category: Category;
  score: number;
  checks: { label: string; status: "pass" | "warn" | "fail"; detail: string }[];
}

export interface Issue {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  evidence: string;
  explanation: string;
  fix: string;
}

export const demoAudits: AuditSummary[] = [
  { id: "a-1042", url: "https://example-bakery.com", client: "Example Bakery", date: "2026-10-22", score: 68, status: "Completed", issues: 14 },
  { id: "a-1041", url: "https://sample-lawfirm.com", client: "Sample Law Firm", date: "2026-10-19", score: 81, status: "Completed", issues: 7 },
  { id: "a-1040", url: "https://demo-fitness.io", client: "Demo Fitness", date: "2026-10-15", score: 54, status: "Completed", issues: 21 },
  { id: "a-1039", url: "https://test-realestate.net", client: "Test Realty", date: "2026-10-11", score: 76, status: "Draft", issues: 10 },
  { id: "a-1038", url: "https://placeholder-dental.com", client: "Placeholder Dental", date: "2026-10-06", score: 88, status: "Completed", issues: 4 },
];

export const demoStats = { totalAudits: 47, websitesAnalyzed: 31, avgScore: 73, openIssues: 56 };

export const demoMonthly = [
  { month: "May", audits: 4 }, { month: "Jun", audits: 6 }, { month: "Jul", audits: 5 },
  { month: "Aug", audits: 9 }, { month: "Sep", audits: 11 }, { month: "Oct", audits: 12 },
];

export const demoResults: CategoryResult[] = [
  { category: "SEO", score: 72, checks: [
    { label: "Title tag", status: "pass", detail: "Present, 54 characters" },
    { label: "Meta description", status: "warn", detail: "Missing on 3 of 12 pages" },
    { label: "H1 heading", status: "fail", detail: "Homepage has 2 H1 tags" },
    { label: "sitemap.xml", status: "pass", detail: "Found and valid" },
  ]},
  { category: "Performance", score: 58, checks: [
    { label: "Largest Contentful Paint", status: "fail", detail: "4.1s (target < 2.5s)" },
    { label: "Total page weight", status: "warn", detail: "3.2 MB" },
    { label: "Text compression", status: "pass", detail: "Gzip enabled" },
  ]},
  { category: "Accessibility", score: 64, checks: [
    { label: "Image alt text", status: "fail", detail: "11 images missing alt" },
    { label: "Color contrast", status: "warn", detail: "4 low-contrast elements" },
    { label: "Form labels", status: "pass", detail: "All inputs labeled" },
  ]},
  { category: "Mobile", score: 79, checks: [
    { label: "Viewport meta tag", status: "pass", detail: "Configured" },
    { label: "Tap target size", status: "warn", detail: "6 targets under 48px" },
    { label: "Horizontal scroll", status: "pass", detail: "None detected" },
  ]},
  { category: "Security", score: 70, checks: [
    { label: "HTTPS", status: "pass", detail: "Valid certificate" },
    { label: "HSTS header", status: "fail", detail: "Not set" },
    { label: "Content-Security-Policy", status: "warn", detail: "Not set" },
  ]},
];

export const demoIssues: Issue[] = [
  { id: "i1", title: "Largest Contentful Paint too slow", category: "Performance", severity: "critical",
    evidence: "LCP measured at 4.1s on homepage hero image (hero-banner.png, 1.8 MB).",
    explanation: "Slow loading of the main content hurts user experience and search rankings.",
    fix: "Compress the hero image, serve WebP/AVIF, and add fetchpriority=\"high\"." },
  { id: "i2", title: "Images missing alt text", category: "Accessibility", severity: "high",
    evidence: "11 <img> elements without an alt attribute, e.g. /images/team-1.jpg.",
    explanation: "Screen reader users cannot understand image content.",
    fix: "Add descriptive alt text; use alt=\"\" for purely decorative images." },
  { id: "i3", title: "HSTS header not configured", category: "Security", severity: "high",
    evidence: "Response headers for / do not include Strict-Transport-Security.",
    explanation: "Browsers may connect over insecure HTTP before redirecting.",
    fix: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains" },
  { id: "i4", title: "Multiple H1 tags on homepage", category: "SEO", severity: "medium",
    evidence: "Found 2 <h1> elements: \"Welcome\" and \"Fresh Bread Daily\".",
    explanation: "A single clear H1 helps search engines understand page topic.",
    fix: "Keep one H1 and change the other heading to H2." },
  { id: "i5", title: "Meta descriptions missing", category: "SEO", severity: "medium",
    evidence: "/about, /menu and /contact have no meta description.",
    explanation: "Search engines may show random page text in results.",
    fix: "Write a unique 120–160 character description for each page." },
  { id: "i6", title: "Small tap targets", category: "Mobile", severity: "low",
    evidence: "6 footer links measure 32×20px on a 375px viewport.",
    explanation: "Small targets are hard to tap accurately on phones.",
    fix: "Increase padding so tap targets are at least 48×48px." },
];

export const severityOrder: Severity[] = ["critical", "high", "medium", "low"];
