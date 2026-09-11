/**
 * importers.js — turns a file the user picks into editor HTML (PB-06).
 *
 *   .docx      → mammoth (keeps headings, lists, bold/italic, tables; images are skipped)
 *   .pdf       → pdf.js text extraction (text only; layout is rebuilt as paragraphs)
 *   .txt / .md → plain paragraphs
 *
 * The libraries are loaded only when a file is imported, so they don't slow
 * down the first page load. Nothing leaves the device.
 */
import { countWords } from '../storage/format';

export const IMPORT_EXTENSIONS = /\.(docx|pdf|txt|md)$/i;
export const IMPORT_ACCEPT = '.docx,.pdf,.txt,.md';
export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

const escapeHtml = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/** Blank lines separate paragraphs; single line breaks stay inside one. */
export function textToHtml(text) {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\r?\n/g, '<br>')}</p>`)
    .join('');
}

function htmlToText(html) {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
}

async function docxToHtml(file) {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.convertToHtml(
    { arrayBuffer: await file.arrayBuffer() },
    { convertImage: mammoth.images.imgElement(() => Promise.resolve({ src: '' })) }, // skip images for now
  );
  return result.value.replace(/<img[^>]*>/g, '');
}

async function pdfToHtml(file) {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const paragraphs = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const { items } = await page.getTextContent();
    let line = '';
    let current = [];
    let lastY = null;
    let lineHeight = 12;

    const endLine = () => {
      if (line.trim()) current.push(line.trim());
      line = '';
    };
    const endParagraph = () => {
      endLine();
      if (current.length) paragraphs.push(current.join(' '));
      current = [];
    };

    items.forEach((item) => {
      if (!('str' in item)) return;
      const y = item.transform[5];
      if (item.height) lineHeight = item.height;
      // A gap bigger than ~1.6 lines between lines starts a new paragraph.
      if (lastY !== null && Math.abs(lastY - y) > lineHeight * 1.6 && !line.trim()) endParagraph();
      line += item.str;
      if (item.hasEOL) endLine();
      lastY = y;
    });
    endParagraph();
    page.cleanup();
  }
  await pdf.destroy();
  return paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join('');
}

/**
 * Reads a file and returns { title, html, wordCount, format }.
 * Throws an Error with a user-facing message when the file can't be used.
 */
export async function importFile(file) {
  if (!IMPORT_EXTENSIONS.test(file.name)) {
    throw new Error('That file type can’t be imported. Use a .docx, .pdf, .txt or .md file (save old .doc or .rtf files as .docx first).');
  }
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error('That file is over the 20 MB limit.');
  }

  const extension = file.name.split('.').pop().toLowerCase();
  let html;
  try {
    if (extension === 'docx') html = await docxToHtml(file);
    else if (extension === 'pdf') html = await pdfToHtml(file);
    else html = textToHtml(await file.text());
  } catch (error) {
    console.error(error);
    throw new Error(`“${file.name}” could not be read. It may be damaged or password-protected.`);
  }

  if (!htmlToText(html).trim()) {
    throw new Error(
      extension === 'pdf'
        ? 'No text was found in that PDF. It may be a scanned image, which needs OCR (not supported yet).'
        : 'That file has no text to import.',
    );
  }

  return {
    title: file.name.replace(/\.[^/.]+$/, '') || 'Imported document',
    html,
    wordCount: countWords(htmlToText(html)),
    format: extension.toUpperCase(),
  };
}
