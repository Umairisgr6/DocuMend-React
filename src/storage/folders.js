/**
 * folders.js — folder reads and writes.
 *
 * "root" is not stored: it is the top level every document and folder
 * sits under when no other folder is chosen.
 */
import { db, newId } from './db';

export const ROOT_FOLDER = { id: 'root', name: 'Root level', meta: 'Main directory' };

export async function createFolder({ name, color = 'gold', parentId = 'root' }) {
  const folder = {
    id: newId(),
    name: name.trim(),
    color,
    parentId,
    createdAt: Date.now(),
  };
  await db.folders.add(folder);
  return folder;
}

/** A–Z by name. */
export function listFolders() {
  return db.folders.orderBy('name').toArray();
}

/** Root first, then saved folders, each with a small "n files" line for the pickers. */
export async function listFolderOptions() {
  const [folders, documents] = await Promise.all([listFolders(), db.documents.toArray()]);
  const countIn = (id) => documents.filter((doc) => doc.folderId === id).length;
  const label = (n) => `${n} ${n === 1 ? 'file' : 'files'}`;
  return [
    ROOT_FOLDER,
    ...folders.map((folder) => ({ id: folder.id, name: folder.name, meta: label(countIn(folder.id)) })),
  ];
}
