# Welcome to your Lovable project
# Smart Dev Website Auditor deployment

## Private Google API configuration

The audit API reads `GOOGLE_PAGESPEED_API_KEY` on the server only. It is already configured in Lovable Cloud. Do **not** create `VITE_PAGESPEED_API_KEY`: all `VITE_` variables are public browser configuration and would expose the credential.

For an external host, supply your Google key as the private runtime environment variable `GOOGLE_PAGESPEED_API_KEY`, enable PageSpeed Insights API in its Google project, and permit that API in the key's restrictions. Do not commit credentials or copy secret values into this repository.

## Hosting

Lovable publishing uses the existing deployment adapter. For self-hosting, connect this repository to Vercel or Netlify, use Bun installation with the committed lockfile, and use `bun run build`. Nitro auto-detects the host; set the build environment `NITRO_PRESET=vercel` or `NITRO_PRESET=netlify` if the host is not detected. Keep the default adapter output rather than adding SPA rewrite rules or deploying only the client assets: server functions are required for audits.

External hosting must allow a server request lasting up to 120 seconds. Lower hosting limits may terminate a Lighthouse audit before Google responds. Verify your hosting plan's limits before going live; no paid service is required or added by this project. External deployments and their limits have not been tested from Lovable.

Set private runtime secrets in the host's environment settings and redeploy after changing them. Lovable secrets do not automatically transfer to external hosting. Generated Cloud integrations may require separate backend credentials if those features are used; the current audit/export flow only needs the Google key.

## Quality checks and reports

- `bun run lint`: code correctness (formatting is separate).
- `bun run test`: regression tests.
- `bunx prettier --check src/lib/audit-report.ts src/lib/audit-pdf.ts src/components/app/PdfReportButton.tsx`: report formatting.
- PDF generation is lazy-loaded, client-side, and data-driven with automatic page breaks; it does not depend on the screen size. Touch devices with file sharing offer Save to Files; other browsers download directly.
- Live audits remain session-only. Dashboard and Reports still show labeled sample data; the real PDF download is on Audit Results.

---

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
