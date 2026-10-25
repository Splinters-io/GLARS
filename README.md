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

- `index.html` - Home page
- `journey.html` - Worked example: one service across three jurisdictions
- `evolution.html` - Roadmap: five planned enhancements
- `glars-deep.html` - The method: the full specification
- `glars-deep.md` - The specification in Markdown. It is not used to build the site, so edit it alongside `glars-deep.html`.
- `css/glars.css` - All styles. The look follows Information Security North Star: cream, black and gold.
- `CNAME` - Custom domain for GitHub Pages (`www.glars.io`)

The site is plain HTML and CSS with no JavaScript, web fonts or third-party assets. GitHub Pages serves the `main` branch.

## Local Development

Serve the folder with any static web server, for example:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## References

The references in the method were checked on 25 October 2026. When adding one, link the primary source where there is one, and check that the citation (title, year, number) matches what the link shows.

## License

© 2025 GLARS. An open methodology for quantifying jurisdictional risks in data sovereignty assessments.