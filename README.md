# DocuMend (React)

The DocuMend marketing site, rebuilt with a plain HTML / CSS / JavaScript / React stack.

This is a faithful visual port of the original DocuMend site (originally built on Replit with
TypeScript, Tailwind CSS, and shadcn/ui). The layout, copy, colors, and interactions are the
same — only the underlying stack changed:

- **React** (plain JavaScript, no TypeScript) for components and state
- **Plain CSS** (`src/index.css`, `src/styles-utilities.css`) — no Tailwind, no CSS framework
- **Vite** as the dev server / build tool
- [`lucide-react`](https://lucide.dev/) for icons

`src/styles-utilities.css` holds small utility classes (`flex`, `gap-4`, `bg-[#d8a53c]`, etc.)
that mirror the class names used in the JSX. They're hand-assembled plain CSS rules, not a
Tailwind build — there's no build-time CSS framework dependency here.

## Run it

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
```

## Structure

- `src/App.jsx` — the whole site (single-page layout, all sections)
- `src/components/ErrorBoundary.jsx` — top-level error boundary
- `src/pages/NotFound.jsx` — 404 fallback
- `src/index.css` — design tokens, base reset, hand-authored component styles
- `src/styles-utilities.css` — utility classes used throughout the JSX
