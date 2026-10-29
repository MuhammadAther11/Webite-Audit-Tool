import { describe, expect, it } from "vitest";
import { auditInput, normalizePageSpeed, providerError } from "@/lib/pagespeed";

const input = { url: "https://example.com", strategy: "desktop" as const, categories: ["performance", "accessibility", "best-practices", "seo"] as const };
// Contract fixtures are test-only and never used for completed audits.
const raw = () => ({ lighthouseResult: {
  finalUrl: "https://example.com/", fetchTime: "2026-10-25T10:53:00Z",
  categories: { performance: { score: 0.87, auditRefs: [{ id: "lcp" }] }, accessibility: { score: 0.92, auditRefs: [] }, "best-practices": { score: 1, auditRefs: [] }, seo: { score: 0.76, auditRefs: [] } },
  audits: { lcp: { title: "Largest Contentful Paint", description: "Reduce load time.", score: 0.3, displayValue: "4.2 s", details: { items: [{ url: "https://example.com/photo.jpg" }] } } },
} });
const request = { ...input, categories: [...input.categories] };
describe("Google PageSpeed contract", () => {
  it("accepts Desktop and Mobile only", () => {
    expect(auditInput.parse(request).strategy).toBe("desktop");
    expect(auditInput.parse({ ...request, strategy: "mobile" }).strategy).toBe("mobile");
    expect(auditInput.safeParse({ ...request, strategy: "tablet" }).success).toBe(false);
  });
  it("requires a HTTP(S) URL and at least one category", () => {
    expect(auditInput.safeParse({ ...request, url: "ftp://example.com" }).success).toBe(false);
    expect(auditInput.safeParse({ ...request, url: "not-a-url" }).success).toBe(false);
    expect(auditInput.safeParse({ ...request, categories: [] }).success).toBe(false);
  });
  it("converts each actual category score to a score out of 100", () => {
    expect(normalizePageSpeed(raw(), request).categories.map((c) => [c.category, c.score])).toEqual([
      ["Performance", 87], ["Accessibility", 92], ["Best Practices", 100], ["SEO", 76],
    ]);
  });
  it("does not substitute a missing score", () => {
    const p = raw();
    const { seo: _seo, ...categories } = p.lighthouseResult.categories;
    expect(normalizePageSpeed({ lighthouseResult: { ...p.lighthouseResult, categories } }, request).categories.find((c) => c.id === "seo")?.score).toBeNull();
  });
  it("preserves actual finding recommendations and evidence", () => {
    const a = normalizePageSpeed(raw(), request).findings[0];
    expect(a?.description).toBe("Reduce load time.");
    expect(a?.details ? JSON.parse(a.details)['items'] : null).toEqual([{ url: "https://example.com/photo.jpg" }]);
    expect(a?.displayValue).toBe("4.2 s");
  });
  it("keeps unavailable field data separate from lab data", () => {
    expect(normalizePageSpeed(raw(), request).field).toEqual([]);
    const a = normalizePageSpeed({ ...raw(), loadingExperience: { metrics: {} }, originLoadingExperience: { id: "https://example.com", metrics: { LARGEST_CONTENTFUL_PAINT_MS: { percentile: 1800, category: "FAST" } } } }, request);
    expect(a.field).toEqual([{ scope: "Origin", url: "https://example.com", category: "Unavailable", metrics: [{ name: "LARGEST_CONTENTFUL_PAINT_MS", percentile: 1800, category: "FAST" }] }]);
  });
  it("rejects failed Lighthouse runs instead of making completed mock audits", () => {
    expect(() => normalizePageSpeed({}, request)).toThrow();
    expect(() => normalizePageSpeed({ lighthouseResult: { ...raw().lighthouseResult, runtimeError: { message: "Navigation failed" } } }, request)).toThrow();
  });
  it("returns readable quota and key errors", () => {
    expect(providerError(429)).toContain("quota");
    expect(providerError(403)).toContain("API key");
  });
});