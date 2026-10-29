import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { auditInput, normalizePageSpeed, providerError, type LiveAudit } from "./pagespeed";

export const runPageSpeed = createServerFn({ method: "POST" })
  .validator((input: unknown) => auditInput.parse(input))
  .handler(async ({ data }): Promise<{ audit: LiveAudit | null; error: string | null }> => {
    setResponseHeader("Cache-Control", "no-store");
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", data.url);
    endpoint.searchParams.set("strategy", data.strategy);
    endpoint.searchParams.set("locale", "en");
    for (const c of data.categories) endpoint.searchParams.append("category", c);
    const key = process.env["GOOGLE_PAGESPEED_API_KEY"];
    if (!key)
      return {
        audit: null,
        error:
          "The Google PageSpeed API key is not configured. Save it securely in project secrets before running an audit.",
      };
    endpoint.searchParams.set("key", key);
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(120_000) });
      if (!response.ok) return { audit: null, error: providerError(response.status) };
      const raw: unknown = await response.json();
      try {
        return { audit: normalizePageSpeed(raw, data), error: null };
      } catch (e) {
        return {
          audit: null,
          error: e instanceof Error ? e.message : "Google returned incomplete audit results.",
        };
      }
    } catch {
      return {
        audit: null,
        error: "The audit timed out or Google could not be reached. Please try again.",
      };
    }
  });
