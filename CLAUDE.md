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
navigating. Pages reached from a dashboard tile rather than the sidebar
(`/upload`, `/create-folder`, `/create-document`) stay out of that map.

The router has no params. To pass a value between pages, put it in the query
string and read it with `URLSearchParams` — the create screens take their
name that way, which also lets them survive a refresh.

## CSS architecture

Three layers, in this order:

1. `src/index.css` — design tokens, reset, font imports. Global.
2. `src/styles-utilities.css` — **a vendored, pre-compiled Tailwind subset.**
   Not a live Tailwind build. A utility class that is not already in this file
   does nothing at all — it fails silently, with no build error. Ported
   prototypes lose their layout this way; write real CSS instead.
3. One stylesheet per page, imported by its own component.

Page styles are class-prefixed so they cannot collide: `landing-`, `signup-`,
`login-`, `docs-`, `dash-`, `editor-`, `history-`, `features-`, `upload-`,
`folder-`, `newdoc-`, `share-`, `pricing-`, `reset-`. Pick a new prefix for a new page
and check it against the others first — `.page-heading`, `.sidebar` and
`.notice` have all collided across files before.

The workspace palette is declared on `.dash-shell`, deliberately not on
`:root`, so it cannot leak into the marketing pages. Dark mode is `.dash-dark`
on that same shell — never on `<html>`. The flag itself comes from
`components/ThemeContext.jsx`: pages call `useTheme()` rather than holding
their own `darkMode` state, and the choice persists to `localStorage`.

**No page-level card frames.** Version history and the editor both used to
wrap their content in a bordered, rounded, shadowed panel. Inside the
workspace chrome that reads as a panel within a panel, and a `max-width` on
the outer box leaves dead gutters. Pages run edge to edge; a centred
`max-width` belongs on the text itself (`.history-content`, `.editor-paper`),
not on the whole page.

## Palette

Canonical values live in `:root` in `index.css`:

| Token | HSL | Hex |
|---|---|---|
| `--accent` | `39 72% 47%` | `#d8a53c` gold |
| `--foreground` | `160 29% 13%` | `#172d26` forest |
| `--background` | `42 31% 92%` | `#f3eee3` cream |

Plus sage `#7caa91`, coral `#c86f52`, gold hover `#b67d18`.

## Naming conventions

- Components `PascalCase.jsx`, stylesheets `kebab-case.css`. **No exceptions
  remain** -- `pricing`, `settings`, `storage`, `version` and `LogIn.css` were
  renamed on 2 Sep 2026, so a lowercase component file is now simply wrong
  rather than "one of the old ones".
- `src/pages/Editor.jsx` in particular: the import in `App.jsx` had been
  flipped to `./pages/editor` and back six times, because a lowercase import
  resolves on Windows and macOS and fails only on Linux. It is `Editor`. If it
  is lowercase again, someone uploaded a file through the GitHub web UI
  instead of pulling first.
- Two files whose names differ only in case cannot coexist here — Windows and
  macOS hold one file, git tracks two. `Features.css` and `features.css` both
  ended up tracked once, from a GitHub web upload. `git rm --cached` the wrong
  one; never plain `git rm`, which may delete the file you meant to keep.

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
- Her changes sometimes arrive as whole-file uploads rather than merges, which
  silently reverts work in files she did not intend to touch (`version.css`
  lost its readability fix this way). After pulling, spot-check any file you
  recently changed. Recovering is a `git cherry-pick -n <sha>` of the original
  commit, not a redo — check first that the reverted file matches the fix's
  parent, and it will replay cleanly.
- Windows' filesystem is case-insensitive, so a rename that only changes case
  is not recorded by `git add`. Use two steps:
  `git mv a.jsx Tmp.jsx && git mv Tmp.jsx A.jsx`. Getting this wrong produces
  a tree that builds on Windows and fails on Linux and macOS.
- `git mv` auto-stages. When splitting work into several commits, stage each
  file explicitly and verify with `git show HEAD:<path>` that each commit's
  imports resolve against its own tree.

## Known open issues

Verified 2 Sep 2026. Fixed items are removed rather than annotated, so
anything listed here is still live.

- **`WorkspaceModal`, medium:** declares `aria-modal="true"` but has no Escape
  handler, no focus trap, and does not move focus into the dialog in logout
  mode. `UploadDocument.jsx` already has a correct Escape handler — copy that
  pattern rather than inventing one.
- 39 lint warnings, almost all unused imports in `Help.jsx`; plus
  `featureData` dead code in `LandingPage.jsx`, and `ThemeContext.jsx`
  exporting a hook alongside a component (which downgrades fast refresh —
  the fix is to split it, as `workspace-nav.js` did).
- Sign-up's social buttons still only show a message; there is no OAuth to
  wire them to yet.
- Nothing persists except the upload screen's recent-documents list. Every
  document, edit, folder and toggle lives in component state and is gone on
  reload.
