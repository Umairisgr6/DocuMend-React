# ODIE engine protocol

How the editor talks to the analysis engine. Written down here so the Rust side
and the JavaScript side can change independently.

## Where the pieces live

| Piece | Path | Runs in |
| --- | --- | --- |
| Rules (the real engine) | `engine/` — Rust, compiled to WebAssembly | Web Worker |
| JavaScript fallback | `src/engine/fallback.js` | Web Worker |
| Worker | `src/engine/worker.js` | Web Worker |
| React hook | `src/engine/useEngine.js` | the page |
| Offsets ↔ editor positions | `src/engine/textmap.js` | the page |

The page never calls the engine directly; it uses the hook.

## Building the Rust engine

```
wasm-pack build engine --target web --out-dir ../src/engine/pkg
```

The output lands in `src/engine/pkg/` and is **not** committed (it is rebuilt
from the Rust source). Without it the worker quietly uses the JavaScript
fallback, so the app always works.

Run the engine's own tests (no internet needed):

```
cargo test --manifest-path engine/Cargo.toml
```

## Messages

The page sends:

```js
{ type: 'analyze', id: 7, text: 'the whole document as plain text' }
```

The worker answers:

```js
{ type: 'ready',  engine: 'wasm' | 'javascript', version: '0.1.0', ms: 412 }
{ type: 'result', id: 7, issues: [...], stats: {...}, engine: 'wasm', ms: 18 }
{ type: 'error',  id: 7, message: '…' }
```

Only the answer whose `id` matches the newest request is used; older answers are
dropped.

## An issue

```js
{
  id: 'number-120-260',          // stable for the same finding
  kind: 'contradiction',         // contradiction | redundancy | structure | citation
  title: 'Numbers do not match',
  message: 'Sentence 3 says PKR 45,000 but sentence 7 says PKR 32,000 …',
  severity: 'high',              // high | medium | low
  location: 'Sentence 3 · Sentence 7',
  start: 120, end: 130,          // the main place to highlight
  related: [{ start: 260, end: 270 }],
  repairs: [                     // may be empty
    { label: 'Use PKR 45,000 everywhere', start: 260, end: 270, text: 'PKR 45,000' }
  ]
}
```

`stats` carries `{ sentences, words, numbers, checks }`.

## Offsets

Every `start` / `end` is a **UTF-16 offset** into the plain text that was sent —
the same numbers JavaScript uses, so `text.slice(start, end)` gives back exactly
the words the issue is about. `src/engine/textmap.js` turns those offsets into
ProseMirror positions for highlighting, and refuses to do so if the document has
changed since the analysis (a fresh analysis follows a second later).

## The checks today

1. **Numbers do not match** — two sentences about the same topic give different
   values for the same unit (PKR 45,000 vs PKR 32,000). Two repairs offered.
2. **Claims disagree** — two near-identical sentences, one of them negated.
   No automatic repair: the writer has to decide which one is true.
3. **Repeated sentence** — two sentences at least 70% the same. Repair: delete
   the second one.

Planned next: structure gaps against the Settings templates (S6 part 2),
citation checks (S8) and the on-device NLI model for softer contradictions (S7).
