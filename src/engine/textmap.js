/**
 * textmap.js — the bridge between the editor and the engine.
 *
 * The engine reads plain text and answers with character offsets ("the problem
 * is at characters 120–130"). The editor works in ProseMirror positions, which
 * count nodes as well as characters. This file builds the plain text once and
 * keeps a small map so an offset can be turned back into a position.
 *
 *   const map = buildTextMap(editor.state.doc);
 *   map.text                    // what the engine analyses
 *   toRange(map, 120, 130)      // → { from, to } for a highlight
 */

/** Plain text of the document plus the map back to editor positions. */
export function buildTextMap(doc) {
  let text = '';
  const segments = []; // { start: index in text, from: position in the document, length }
  doc.descendants((node, pos) => {
    if (node.isText) {
      segments.push({ start: text.length, from: pos, length: node.text.length });
      text += node.text;
      return false;
    }
    // A new block (paragraph, heading, list item…) starts a new line, so the
    // engine never joins the end of one paragraph to the start of the next.
    if (node.isBlock && text.length > 0 && !text.endsWith('\n')) text += '\n';
    return true;
  });
  return { text, segments };
}

/** The editor position of one character offset. */
function positionOf(map, offset, { after = false } = {}) {
  const { segments } = map;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const end = segment.start + segment.length;
    if (offset < segment.start) return segment.from; // the offset sits on a line break
    if (offset < end || (after && offset === end)) return segment.from + (offset - segment.start);
  }
  const last = segments[segments.length - 1];
  return last ? last.from + last.length : 0;
}

/**
 * Turns an engine range into an editor range.
 * Returns null when the text has changed so much that the range no longer fits.
 */
export function toRange(map, start, end) {
  if (!map.segments.length || !(end > start)) return null;
  const from = positionOf(map, start);
  const to = positionOf(map, end, { after: true });
  if (!(to > from)) return null;
  return { from, to };
}

/** The class the highlight uses, by issue kind. */
export function highlightClass(kind) {
  const known = ['contradiction', 'structure', 'redundancy', 'citation'];
  const name = known.includes(kind) ? kind : 'contradiction';
  return `editor-heatmap-mark heatmap-${name}`;
}
