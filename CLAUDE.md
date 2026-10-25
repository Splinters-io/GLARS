# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
GLARS (Geo-Legal Access Risk Score) is a static website for documenting an objective, apolitical framework for quantifying jurisdictional risks in data sovereignty assessments.

## Build/Test Commands
- Local development: `python3 -m http.server 8080 --directory public`, then open `http://localhost:8080`
- There is no build step. Cloudflare Pages publishes `public/` from the `main` branch; other branches get preview URLs.
- Check HTML validity: Use the W3C Validator (https://validator.w3.org/)
- Check for broken links: `npx broken-link-checker http://localhost:8080`

## Code Style Guidelines
- HTML: Semantic structure with 2-space indentation; en-GB spelling
- CSS: one stylesheet, `public/css/glars.css`, using the variables in `:root`; kebab-case class names; no inline styles
- No JavaScript, web fonts or third-party assets
- Content: primary sources only. Never add a law, agency power, statistic or reference that cannot be linked to legislation or an official publication.
- `glars-deep.md` and `public/glars-deep.html` hold the same specification; change both
- `public/_headers` sets a strict CSP: no inline styles or scripts, no third-party sources
- Documentation: Update README.md when making significant changes
