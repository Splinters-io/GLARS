# GLARS Documentation Site

This repository contains the GLARS (Geo-Legal Access Risk Score) website: a calculator plus the methodology documentation.

## About GLARS

GLARS is an objective, apolitical framework for quantifying jurisdictional risks in data sovereignty assessments. It relies solely on documented legal frameworks, published government powers, and verifiable technical requirements across jurisdictions.

> This project is a [Splinters.io](https://splinters.io) 001.5 project via [John Carroll](https://www.linkedin.com/in/thecontractor/)

### Key Principles

- **Evidence-Based**: Uses only publicly available legal frameworks and official documentation
- **Objective Scoring**: Applies consistent criteria across all jurisdictions regardless of political systems
- **Transparent Methodology**: Fully documented approach with traceable score derivation
- **Practical Utility**: Focuses on actual legal powers that affect data governance decisions

## Project Structure

Everything under `public/` is published; nothing else in the repository is.

- `public/index.html` - What GLARS is, how to use the calculator, the calculator, and the roadmap (home page)
- `public/journey.html` - Multi-jurisdiction data journey worked example (`/journey`), with the "Follow the data" timeline written as static HTML
- `public/glars-deep.html` - Full methodology (`/glars-deep`)
- `public/legal.html` - Notices and privacy (`/legal`)
- `public/404.html` - Not-found page
- `public/css/style.css` - All styles; colour tokens are at the top, with a dark theme
- `public/js/theme.js` - Applies a saved light/dark preference before first paint
- `public/js/main.js` - Theme toggle, table-of-contents tracking, and the hover note on Juri links
- `public/js/calculator.js` - Calculator scoring, vector parsing and examples
- `public/js/timeline.js` - Highlights a power's path on the Journey timeline (optional: the timeline reads fine without it)
- `public/js/perspective.js` - The Perspective score: the Base score adjusted for where the question is asked from
- `public/data/examples.json` - Calculator examples and explainers
- `public/data/scoring-guide.json` - Per-component questions and measuring-stick bands
- `public/data/perspective.json` - Perspective inputs: treaty facts, default weights and World Bank WGI 2025 values (CC BY 4.0)
- `public/fonts/` - Self-hosted Source Serif 4, Inter and JetBrains Mono (latin subsets, SIL OFL)
- `public/_headers` - Security headers and caching (Cloudflare)
- `public/_redirects` - Path redirects (Cloudflare)
- `glars-deep.md` - Markdown source the Deep Dive was written from
- `wrangler.jsonc` - Cloudflare Workers static-assets config and the `glars.io` custom domain

The site loads nothing from third parties, which lets `_headers` set a strict Content Security Policy (`'self'` only). Keep scripts and styles in their own files: inline `<script>` blocks and `style="..."` attributes are blocked.

## The calculator

The calculator implements the Deep Dive's scoring methodology:

```
Base  = JO×0.20 + AP×0.25 + TR×0.15 + EX×0.25 + TP×0.15
GLARS = max(Base, EI, SS)
```

Levels are Low (0–40), Medium (41–65) and High (66–100).

The **Perspective score** adjusts the Base score for where the question is asked from and where the data is held:

```
M        = clamp(product of the factors that apply, 0.8, 1.3)
GLARS-P  = min(100, max(Base × M, EI × rEI, SS × rSS))
```

Factors are Five Eyes sharing, CLOUD Act agreements and adequacy findings (treaty facts with GLARS default weights) and the governance gap from the World Bank Worldwide Governance Indicators. Defaults are in `public/data/perspective.json`; users can change any weight, and the link carries the changes as `P:`, `J:`, `W:` and `R:` tokens. To refresh the WGI values, rebuild `governance.values` from the World Bank API indicators `GOV_WGI_RL.SC` and `GOV_WGI_PV.SC` (source 3) and update `governance.label` and `year`.

The current vector is written to the URL fragment, so any assessment can be shared as a link, for example `/#GLARS:1.0/B:JO:57/AP:80/TR:68/EX:85/TP:58/EI:70/SS:55`. Components left out of a vector stay unscored, so a partial assessment (such as one from Juri before every component is assessed) loads as partial.

### Adding an example

Add an object to the `examples` array in `public/data/examples.json`. Examples appear in the order listed, and the first one loads by default.

```json
{
  "id": "unique-id",
  "kind": "Worked example",
  "title": "Shown in the picker and as the explainer heading",
  "summary": "One or two sentences shown under the title.",
  "explainer": ["Paragraph shown under 'Read the explainer'.", "Another paragraph."],
  "values": { "JO": 0, "AP": 0, "TR": 0, "EX": 0, "TP": 0, "EI": 0, "SS": 0 },
  "rationale": { "AP": "Optional note shown under a field while it matches the example value." },
  "sources": [{ "label": "Act or document name", "url": "https://..." }],
  "link": { "label": "Optional further reading", "url": "/journey" }
}
```

`id`, `title` and all seven `values` are required; everything else is optional. Text is inserted as plain text (no HTML), and links must be `https://` or site-relative.

## Local Development

Run the site with Cloudflare's local server so clean URLs, redirects and headers behave as they do in production:

```
npx wrangler dev
```

Then open `http://localhost:8787`.

## Deployment

The site is served by Cloudflare as Workers static assets. To deploy:

```
./deploy.sh
```

or `npx wrangler deploy`. The `routes` entry in `wrangler.jsonc` attaches `glars.io` as a custom domain, and Cloudflare creates the DNS record and certificate on first deploy. The zone must be on the same Cloudflare account.

## License

- **Methodology and content** (page text, `glars-deep.md`, `public/data/examples.json`, images): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).
- **Code** (`public/js/`, `public/css/`, `deploy.sh`, `wrangler.jsonc`): MIT. See [`LICENSE`](LICENSE).
- **Fonts** in `public/fonts/`: SIL Open Font License 1.1, by their respective authors.
