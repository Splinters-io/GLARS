# GLARS Documentation Site

This repository contains the GLARS (Geo-Legal Access Risk Score) documentation website.

## About GLARS

GLARS is an objective, apolitical framework for quantifying jurisdictional risks in data sovereignty assessments. It relies solely on documented legal frameworks, published government powers, and verifiable technical requirements across jurisdictions.

> This project is a [Splinters.io](https://splinters.io) 001.5 project via [John Carroll](https://www.linkedin.com/in/thecontractor/)

### Key Principles

- **Evidence-Based**: Uses only publicly available legal frameworks and official documentation
- **Objective Scoring**: Applies consistent criteria across all jurisdictions regardless of political systems
- **Transparent Methodology**: Fully documented approach with traceable score derivation
- **Practical Utility**: Focuses on actual legal powers that affect data governance decisions

## Project Structure

Everything published is in `public/`:

- `public/index.html` - Home page
- `public/journey.html` - Worked example: one service across three jurisdictions
- `public/evolution.html` - Roadmap: five planned enhancements
- `public/glars-deep.html` - The method: the full specification
- `public/css/glars.css` - All styles. The look follows Information Security North Star: cream, black and gold.
- `public/_headers` - Cloudflare response headers, including a strict Content Security Policy

Outside it, and not published:

- `glars-deep.md` - The specification in Markdown. It is not used to build the site, so edit it alongside `public/glars-deep.html`.
- `wrangler.toml` - Cloudflare Pages configuration

The site is plain HTML and CSS with no JavaScript, web fonts or third-party assets. The Content Security Policy enforces that: an inline style or script will be blocked.

## Hosting

Cloudflare Pages, connected to this repository. Pushing to `main` deploys; other branches get preview deployments.

- Build command: none
- Build output directory: `public`
- Custom domains: `glars.io` and `www.glars.io`

If the domain is proxied through Cloudflare, keep Rocket Loader, Email Obfuscation, Web Analytics automatic injection and Zaraz switched off: they inject scripts that the Content Security Policy blocks.

## Local Development

Serve the published folder with any static web server, for example:

```
python3 -m http.server 8080 --directory public
```

Then open `http://localhost:8080`.

## References

The references in the method were checked on 25 October 2026. When adding one, link the primary source where there is one, and check that the citation (title, year, number) matches what the link shows.

## License

© 2025 GLARS. An open methodology for quantifying jurisdictional risks in data sovereignty assessments.