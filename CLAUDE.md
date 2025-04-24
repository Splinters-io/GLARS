# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
GLARS (Geo-Legal Access Risk Score) is a static website for documenting an objective, apolitical framework for quantifying jurisdictional risks in data sovereignty assessments.

## Build/Test Commands
- Local development: `http-server .`
- Preview HTML files: Open them directly in a browser
- Check HTML validity: Use the W3C Validator (https://validator.w3.org/)
- Check for broken links: `npx broken-link-checker http://localhost:8080`
- Lint HTML: `npx html-validate *.html`
- Lint CSS: `npx stylelint css/*.css`
- Lint JavaScript: `npx eslint js/*.js`

## Code Style Guidelines
- HTML: Semantic structure with 2-space indentation
- CSS: 
  - Component-based approach using CSS variables for theming
  - Descriptive class names with kebab-case
- JavaScript: 
  - Camel case for function and variable names
  - Clean, modular functions with meaningful names
  - DOM manipulation wrapped in DOMContentLoaded
  - Error handling with try/catch for async operations
- File Structure: Maintain separation of concerns (HTML, CSS, JS)
- Documentation: Update README.md when making significant changes
- Imports: No external dependencies beyond basic utility libraries