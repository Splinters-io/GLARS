# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
GLARS (Geo-Legal Access Risk Score) is a static website for documenting an objective, apolitical framework for quantifying jurisdictional risks in data sovereignty assessments.

## Build/Test Commands
- Local development: `http-server .`
- Preview HTML files: Open them directly in a browser
- Check HTML validity: `npx html-validator-cli --file=*.html`
- Check for broken links: `npx broken-link-checker http://localhost:8080`
- Lint CSS: `npx stylelint "**/*.css"`

## Code Style Guidelines
- HTML: Semantic structure with 2-space indentation, HTML5 doctype
- CSS: 
  - Component-based approach using CSS variables for theming
  - Mobile-first responsive design with media queries
- JavaScript: 
  - Camel case for function and variable names
  - Clean, modular functions with meaningful names
  - DOM manipulation wrapped in DOMContentLoaded
  - ES6+ syntax with const/let (avoid var)
- Error Handling: Use try/catch blocks for async operations
- File Structure: Maintain separation of concerns (HTML, CSS, JS)
- Documentation: Update README.md when making significant changes