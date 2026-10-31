# alwaysprince05.github.io

Personal portfolio of Prince Kumar Maurya, built with React 18, TypeScript and Vite.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

## Structure

- `src/data.ts`: merged / open PR list and contribution calendar (update this to refresh the numbers)
- `src/components/`: Nav, Bento (hero tiles), Sections (work, case study, projects, about, contact), CommandPalette
- `src/styles.css`: design tokens and all styles (dark + light themes)

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
