# CLAUDE.md — heg.ai Community Website

## Project Overview

Static HTML website for the **heg.ai community** — a professional network of creators (researchers, product managers, designers, founders) focused on generative AI. Content is in **Russian**.

**No build step required.** All files are served as-is — pure HTML, CSS, and vanilla JavaScript with zero external dependencies (except Google Fonts).

## File Structure

```
├── index.html                      # Community member listing (main page)
├── participant.html                # Profile template (reference only)
├── participant-*.html              # Individual member profile pages (6 total)
├── ai-transformation.html          # AI business transformation landing page
├── hegai-gpt.html                  # Interactive ChatGPT-style assistant UI
├── preview.sh                      # Local dev server script
├── README.md                       # Project documentation (Russian)
└── assets/
    ├── styles.css                  # Shared styles for index + participant pages
    ├── transformation.css          # Styles for ai-transformation.html
    ├── transformation.js           # Tab/accordion logic for transformation page
    └── hegai-gpt.js                # Full chat interface logic (localStorage-backed)
```

## Running Locally

```bash
# Serve on http://localhost:8000
python3 -m http.server 8000
```

Or use the included script:
```bash
./preview.sh
```

There is no build, transpilation, or bundling step.

## Tech Stack & Conventions

### HTML
- Semantic HTML5 with accessibility attributes (`role`, `aria-*`)
- Common head boilerplate across all pages: charset UTF-8, viewport meta, Google Fonts ("Onest"), link to `assets/styles.css`
- Layout pattern: `.page` wrapper > `<header>` > `<main>` > `<footer>`
- Navigation in header links between index, ai-transformation, and hegai-gpt pages

### CSS
- **No CSS framework** — custom design system using CSS variables
- Key variables defined in `:root` of `styles.css`:
  - `--accent: #4656ff` (primary blue)
  - `--text-primary: #111827`, `--text-secondary: #5f6c86`
  - `--surface: #ffffff`, `--bg: #f5f7fb`
- Responsive design using `clamp()` for fluid typography, CSS Grid and Flexbox for layouts
- Mobile-first approach with appropriate breakpoints
- `transformation.css` is a separate stylesheet only for `ai-transformation.html`

### JavaScript
- **Vanilla JS (ES6+)** — no frameworks or libraries
- `hegai-gpt.js`: Full chat app with state management, conversation history in `localStorage` (key: `hegaiGPT.conversations.v1`), knowledge base snippets (hard-coded demo data, no backend)
- `transformation.js`: Tab switching and accordion/collapsible sections with smooth height animations
- Both use direct DOM manipulation and event delegation

## Page Navigation Map

```
index.html ─┬─► ai-transformation.html
             ├─► hegai-gpt.html
             └─► participant-*.html ──► index.html (back link)
```

## Adding a New Participant Profile

1. Copy `participant.html` as a template
2. Name the file `participant-firstname-lastname.html`
3. Update: avatar initials, name, role, location, timezone, summary, expertise tags, experience items, portfolio items, and CTA links
4. Add a corresponding card in `index.html` inside the `#participants` section, linking to the new profile page
5. Follow the existing card pattern: `.participant-card` with avatar, name, role, description, and `.participant-tags`

## Git Workflow

- **Branch naming**: `codex/[feature-description]-[short-id]` or `claude/[description]-[id]`
- **Commit messages**: Short, imperative descriptions of the change (e.g., "Add AI transformation landing page", "Tighten chat composer layout")
- **PR flow**: Feature branches merge into `main` via pull requests
- **Default branch**: `main`

## Known Issues

- **Unresolved merge conflicts** exist in `hegai-gpt.html`, `assets/styles.css` (line ~28-34), and `assets/hegai-gpt.js` (line ~71-75). These contain `<<<<<<<`, `=======`, `>>>>>>>` markers that need resolution.
- `hegai-gpt.js` uses hard-coded demo data — not connected to a real backend.

## Key Rules for AI Assistants

1. **No build tools** — do not introduce npm, webpack, or any build system unless explicitly asked.
2. **Keep it static** — all pages are plain HTML/CSS/JS. No templating engines or server-side rendering.
3. **Preserve the design system** — reuse existing CSS variables and class naming conventions. Do not introduce a CSS framework.
4. **Russian language** — all user-facing text content is in Russian. Maintain this convention.
5. **Accessibility** — existing code uses aria attributes and semantic HTML. Continue this practice.
6. **Font** — the project uses "Onest" from Google Fonts (weights: 400, 500, 600, 700). Do not add other fonts.
7. **No external JS dependencies** — everything is vanilla JavaScript. Do not add jQuery, React, or other libraries.
8. **File paths** — all asset references use relative paths (e.g., `assets/styles.css`). Keep this consistent.
