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

- `index.html` - Main landing page
- `evolution.html` - GLARS Evolution roadmap
- `journey.html` - Multi-jurisdiction data journey visualization
- `glars-deep.html` - Comprehensive deep dive into GLARS (HTML-based)
- `glars-rfc.md` - GLARS specification in Markdown format (used to generate HTML content)
- `css/style.css` - Combined CSS styles
- `js/main.js` - JavaScript functionality
- `_headers` - HTTP headers for GitHub Pages
- `_redirects` - URL redirects for GitHub Pages

## Local Development

To preview the site locally:

1. Install a local web server:
   ```
   npm install -g http-server
   ```

2. Run the server:
   ```
   http-server .
   ```

3. Open your browser to `http://localhost:8080`

## Customization

- Update `css/style.css` to change the site's appearance
- Modify `js/main.js` to adjust interactive behavior
- Edit the HTML files to update content

## License

© 2025 GLARS. An open methodology for quantifying jurisdictional risks in data sovereignty assessments.