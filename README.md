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

- `index.html` - Calculator and overview (home page)
- `journey.html` - Multi-jurisdiction data journey worked example (`/journey`)
- `evolution.html` - GLARS Evolution roadmap (`/evolution`)
- `glars-deep.html` - Full methodology (`/glars-deep`)
- `glars-deep.md` - Markdown source the Deep Dive was written from
- `404.html` - Not-found page
- `css/style.css` - All styles; colour tokens are at the top, with a dark theme
- `js/theme.js` - Applies a saved light/dark preference before first paint
- `js/main.js` - Theme toggle and table-of-contents tracking
- `js/calculator.js` - Calculator scoring, vector parsing and examples
- `data/examples.json` - Calculator examples and explainers
- `fonts/` - Self-hosted Source Serif 4, Inter and JetBrains Mono (latin subsets, SIL OFL)
- `_headers` - Security headers and caching (Cloudflare)
- `_redirects` - Path redirects (Cloudflare)
- `wrangler.jsonc` - Cloudflare Workers static-assets config
- `.assetsignore` - Repository files that are not published

The site loads nothing from third parties, which lets `_headers` set a strict Content Security Policy (`'self'` only). Keep scripts and styles in their own files: inline `<script>` blocks and `style="..."` attributes are blocked.

## The calculator

The calculator implements the Deep Dive's scoring methodology:

```
Base  = JO×0.20 + AP×0.25 + TR×0.15 + EX×0.25 + TP×0.15
GLARS = max(Base, EI, SS)
```

Levels are Low (0–40), Medium (41–65) and High (66–100), and a High embargo or sanction makes the overall level High. The current vector is written to the URL fragment, so any assessment can be shared as a link, for example `/#GLARS:1.0/B:JO:57/AP:80/TR:68/EX:85/TP:58/EI:70/SS:55`.

### Adding an example

Add an object to the `examples` array in `data/examples.json`. Examples appear in the order listed, and the first one loads by default.

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

or `npx wrangler deploy`. Attach `www.glars.io` to the Worker under Settings > Domains & Routes, and add a redirect rule in the zone from `glars.io` to `https://www.glars.io`.

## License

© 2025–2026 GLARS. An open methodology for quantifying jurisdictional risks in data sovereignty assessments.
