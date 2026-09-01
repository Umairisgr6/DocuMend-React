# DocuMend — project notes

Privacy-first document editor: marketing site + workspace app. University FYP.
Vite 8 + React 19, plain JSX (no TypeScript), oxlint.

## Running it

Node lives at `C:\Program Files\nodejs\` and is **not on PATH**. Every command
needs the prefix:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
npm run dev -- --port 5180 --host
```

`--host` matters: without it Vite binds IPv6-only and the phone/LAN preview
fails. Port 5180 rather than the default 5173, because another DocuMend
project on this machine also serves on 5173 — if a page looks stale or wrong,
check which app is answering (`/src/main.jsx` is this one, `/src/main.tsx` is
the old one).

## Routing

There is no router library. `src/router.js` is ~30 lines:

- `navigate(path)` — `pushState` plus a synthetic `PopStateEvent`, because
  `pushState` does not fire `popstate` on its own.
- `usePathname()` — subscribes to `popstate` so route changes re-render.

`src/App.jsx` is the route table. Adding a page means **two** edits:

1. a line in `App.jsx`'s `Router()`
2. an entry in `workspaceRoutes` in `src/components/workspace-nav.js`

Skip step 2 and the sidebar link silently falls back to a toast instead of
navigating.

## CSS architecture

Three layers, in this order:

1. `src/index.css` — design tokens, reset, font imports. Global.
2. `src/styles-utilities.css` — **a vendored, pre-compiled Tailwind subset.**
   Not a live Tailwind build. A utility class that is not already in this file
   does nothing at all — it fails silently, with no build error. Ported
   prototypes lose their layout this way; write real CSS instead.
3. One stylesheet per page, imported by its own component.

Page styles are class-prefixed so they cannot collide: `landing-`, `signup-`,
`docs-`, `dash-`, `editor-`.

The workspace palette is declared on `.dash-shell`, deliberately not on
`:root`, so it cannot leak into the marketing pages. Dark mode is `.dash-dark`
on that same shell — never on `<html>`.

## Palette

Canonical values live in `:root` in `index.css`:

| Token | HSL | Hex |
|---|---|---|
| `--accent` | `39 72% 47%` | `#d8a53c` gold |
| `--foreground` | `160 29% 13%` | `#172d26` forest |
| `--background` | `42 31% 92%` | `#f3eee3` cream |

Plus sage `#7caa91`, coral `#c86f52`, gold hover `#b67d18`.

## Naming conventions

- Components `PascalCase.jsx`, stylesheets `kebab-case.css`.
- Existing violations, left alone rather than churned:
  `pricing.jsx`, `version.jsx` (should be PascalCase) and `LogIn.css`
  (should be kebab-case).

## The editor

`src/pages/Editor.jsx` uses `contentEditable` + `document.execCommand`.
`execCommand` is deprecated but universally supported and needs no
dependency. Two things that look like mistakes but are not:

- Toolbar buttons use `onMouseDown` + `preventDefault`, so the editable
  surface does not blur and lose the selection the command acts on.
- The initial content is seeded once behind an `editorRef.current.dataset.ready`
  guard, so a re-render cannot wipe what the user has typed.

Find-bar match counting happens in the input's `onChange`, not during render —
the document text is in a ref, and reading a ref while rendering returns a
stale value because mutating it schedules no re-render.

**TipTap is entirely unused.** Ten packages remain in `package.json` from an
earlier version of the editor. Removing them is safe but has not been done.

## Git

- Commits are authored by Umairisgr6 alone. **Never add a `Co-Authored-By:`
  trailer.**
- Mahnoor Aslam pushes directly to `main`, often mid-session. Always fetch
  before pushing. `App.jsx` conflicts nearly every time; the resolution is
  always to keep every route from both sides.
- **Never force-push** — Mahnoor's commits sit on top of shared history.
- Windows' filesystem is case-insensitive, so a rename that only changes case
  is not recorded by `git add`. Use two steps:
  `git mv a.jsx Tmp.jsx && git mv Tmp.jsx A.jsx`. Getting this wrong produces
  a tree that builds on Windows and fails on Linux and macOS.
- `git mv` auto-stages. When splitting work into several commits, stage each
  file explicitly and verify with `git show HEAD:<path>` that each commit's
  imports resolve against its own tree.

## Known open issues

- **Dashboard, high:** `QuickAction` sets a preventDefault `onDragOver` on all
  four tiles but only "Upload / drop" has an `onDrop`. Dropping a file on any
  other tile navigates the tab away and destroys all in-memory state.
- **`WorkspaceModal`, medium:** declares `aria-modal="true"` but has no Escape
  handler, no focus trap, and does not move focus into the dialog in logout
  mode.
- `Dashboard.jsx` carries ~427 lines of commented-out duplicate code.
- `featureData` in `LandingPage.jsx` is dead code (a standing lint warning).
- Login's "Sign Up" / "Forgot password?" links and sign-up's social buttons
  only show a message.
