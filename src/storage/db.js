/**
 * db.js — the one IndexedDB database DocuMend keeps in the browser.
 *
 * Dexie wraps IndexedDB. The strings below list each store's primary key
 * first, then the fields we search or sort by. Other fields can still be
 * saved on a record; they just can't be queried quickly.
 *
 * To add a store or an index later, never edit version(1) — add
 * db.version(2).stores({...}) underneath with the full new list.
 * Planned for later versions: analysis, citations, embeddings,
 * auditLog, syncQueue (see docs/data-model.md).
 */
import Dexie from 'dexie';

export const db = new Dexie('documend');

db.version(1).stores({
  documents: 'id, folderId, category, updatedAt',
  folders: 'id, parentId, name',
  versions: 'id, docId, createdAt',
  settings: 'key',
});

/** An id that also works on http:// LAN addresses, where crypto.randomUUID is missing. */
export function newId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
