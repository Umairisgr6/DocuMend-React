/**
 * fallback.js — the same checks as the Rust engine, written in JavaScript.
 *
 * The real engine is Rust compiled to WebAssembly (see /engine). This file is
 * the safety net: it runs when the .wasm file has not been built yet, or if the
 * browser refuses to load it. It finds the same kinds of problems, a little
 * more simply, so the editor is never left without an analyser.
 *
 * The report has exactly the shape the Rust engine returns, so nothing else in
 * the app needs to know which one answered.
 */

const STOPWORDS = new Set([
  'about', 'after', 'again', 'against', 'along', 'also', 'although', 'always', 'among', 'another',
  'around', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'cannot', 'could',
  'does', 'doing', 'down', 'during', 'each', 'either', 'else', 'even', 'ever', 'every', 'from',
  'further', 'have', 'having', 'here', 'however', 'into', 'just', 'like', 'made', 'make', 'many',
  'more', 'most', 'much', 'must', 'near', 'need', 'next', 'once', 'only', 'other', 'over', 'part',
  'same', 'shall', 'should', 'since', 'some', 'such', 'than', 'that', 'their', 'them', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'thus', 'under', 'until', 'upon', 'used',
  'using', 'very', 'were', 'what', 'when', 'where', 'which', 'while', 'will', 'with', 'within',
  'without', 'would', 'your',
]);

const NEGATIONS = new Set([
  'not', 'never', 'no', 'none', 'cannot', 'cant', 'dont', 'doesnt', 'didnt', 'wont', 'isnt',
  'arent', 'wasnt', 'werent', 'without', 'neither', 'nor', 'fails', 'failed', 'unable',
]);

const CURRENCIES = {
  pkr: 'PKR', rs: 'PKR', rupees: 'PKR', rupee: 'PKR', '₨': 'PKR',
  usd: 'USD', $: 'USD', dollars: 'USD', dollar: 'USD',
  eur: 'EUR', '€': 'EUR', euros: 'EUR', euro: 'EUR',
  gbp: 'GBP', '£': 'GBP', pounds: 'GBP', pound: 'GBP',
};

const MULTIPLIERS = {
  hundred: 100, thousand: 1e3, k: 1e3, lakh: 1e5, million: 1e6, m: 1e6, mn: 1e6,
  crore: 1e7, billion: 1e9, bn: 1e9,
};

const NOT_UNITS = new Set(['and', 'are', 'but', 'for', 'in', 'is', 'of', 'on', 'or', 'per', 'than', 'the', 'to', 'was', 'were', 'with']);

const MAX_SENTENCES = 600;
const MAX_ISSUES = 60;

/** Splits text into sentences, keeping each one's offset in the text. */
export function splitSentences(text) {
  const sentences = [];
  let begin = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (!'.!?\n۔؟'.includes(c)) continue;
    const isDecimal = c === '.' && /\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '');
    if (isDecimal) continue;
    push(text, begin, i + 1, sentences);
    begin = i + 1;
  }
  push(text, begin, text.length, sentences);
  return sentences;
}

function push(text, begin, end, out) {
  let first = begin;
  let last = end;
  while (first < last && /\s/.test(text[first])) first += 1;
  while (last > first && /\s/.test(text[last - 1])) last -= 1;
  const body = text.slice(first, last);
  if (/[\p{L}\p{N}]/u.test(body)) out.push({ index: out.length, text: body, start: first, end: last });
}

const wordsOf = (text) => (text.toLowerCase().match(/[\p{L}\p{N}']+/gu) || []).map((w) => w.replace(/'/g, ''));

/** The words worth comparing: four letters or more, no numbers, no stopwords. */
export function contentWords(text) {
  return [...new Set(wordsOf(text).filter((w) => w.length >= 4 && /^[\p{L}]+$/u.test(w) && !STOPWORDS.has(w)))].sort();
}

const negationOf = (text) => wordsOf(text).find((w) => NEGATIONS.has(w)) || null;
const sharedWords = (a, b) => a.filter((w) => b.includes(w));

function similarity(a, b) {
  if (!a.length || !b.length) return 0;
  const shared = sharedWords(a, b).length;
  const union = a.length + b.length - shared;
  return union ? shared / union : 0;
}

const singular = (word) => {
  const lower = word.toLowerCase();
  if (lower.endsWith('ies') && lower.length > 4) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) return lower.slice(0, -1);
  return lower;
};

/** Every number in one sentence, with its unit and its offset in the document. */
export function numbersIn(sentence) {
  const facts = [];
  const body = sentence.text;
  const pattern = /\d[\d,]*(?:\.\d+)?/g;
  let match = pattern.exec(body);
  while (match) {
    let value = Number(match[0].replace(/,/g, ''));
    let unit = '';
    let start = match.index;
    let end = match.index + match[0].length;

    const before = body.slice(0, start).match(/([\p{L}$€£₨]+)\.?\s*$/u);
    if (before) {
      const code = CURRENCIES[before[1].toLowerCase()];
      if (code) {
        unit = code;
        start -= before[0].length;
      }
    }

    const after = body.slice(end).match(/^\s*(%|[\p{L}]+)/u);
    if (after) {
      const word = after[1].toLowerCase();
      if (word === '%' || word === 'percent' || word === 'percentage') {
        unit = '%';
        end += after[0].length;
      } else if (MULTIPLIERS[word]) {
        value *= MULTIPLIERS[word];
        end += after[0].length;
        const next = body.slice(end).match(/^\s*([\p{L}]+)/u);
        if (next && !unit) {
          const nextWord = next[1].toLowerCase();
          if (CURRENCIES[nextWord]) { unit = CURRENCIES[nextWord]; end += next[0].length; }
          else if (isUnitWord(nextWord)) { unit = singular(nextWord); end += next[0].length; }
        }
      } else if (!unit && CURRENCIES[word]) {
        unit = CURRENCIES[word];
        end += after[0].length;
      } else if (!unit && isUnitWord(word)) {
        unit = singular(word);
        end += after[0].length;
      }
    }

    facts.push({
      value,
      unit,
      raw: body.slice(start, end).trim(),
      start: sentence.start + start,
      end: sentence.start + end,
    });
    pattern.lastIndex = Math.max(pattern.lastIndex, end);
    match = pattern.exec(body);
  }
  return facts;
}

const isUnitWord = (word) => word.length >= 2 && /^[\p{L}]+$/u.test(word) && !NOT_UNITS.has(word);

const label = (sentence) => `Sentence ${sentence.index + 1}`;
const topic = (shared) => shared.slice(0, 2).join(' / ');

/** Reads a document and reports what is wrong with it. */
export function analyze(text) {
  const sentences = splitSentences(text).slice(0, MAX_SENTENCES);
  const prepared = sentences
    .map((sentence) => ({
      sentence,
      words: contentWords(sentence.text),
      numbers: numbersIn(sentence),
      negation: negationOf(sentence.text),
    }))
    .filter((item) => item.sentence.text.split(/\s+/).length <= 120);

  const issues = [];
  for (let i = 0; i < prepared.length && issues.length < MAX_ISSUES; i += 1) {
    for (let j = i + 1; j < prepared.length && issues.length < MAX_ISSUES; j += 1) {
      const a = prepared[i];
      const b = prepared[j];
      const shared = sharedWords(a.words, b.words);
      if (shared.length < 2) continue;
      const before = issues.length;

      a.numbers.forEach((first) => {
        b.numbers.forEach((second) => {
          const comparable = first.unit === second.unit
            && (first.unit !== '' || shared.length >= 3)
            && first.value !== second.value;
          if (!comparable) return;
          issues.push({
            id: `number-${first.start}-${second.start}`,
            kind: 'contradiction',
            title: 'Numbers do not match',
            message: `${label(a.sentence)} says ${first.raw} but ${label(b.sentence).toLowerCase()} says ${second.raw} about the same topic — ${topic(shared)}${first.unit ? ` (${first.unit})` : ''}.`,
            severity: first.unit ? 'high' : 'medium',
            location: `${label(a.sentence)} · ${label(b.sentence)}`,
            start: first.start,
            end: first.end,
            related: [{ start: second.start, end: second.end }],
            repairs: [
              { label: `Use ${first.raw} everywhere`, start: second.start, end: second.end, text: first.raw },
              { label: `Use ${second.raw} everywhere`, start: first.start, end: first.end, text: second.raw },
            ],
          });
        });
      });

      const oneIsNegated = Boolean(a.negation) !== Boolean(b.negation);
      if (oneIsNegated && shared.length >= 3 && similarity(a.words, b.words) >= 0.5) {
        issues.push({
          id: `claim-${a.sentence.start}-${b.sentence.start}`,
          kind: 'contradiction',
          title: 'Claims disagree',
          message: `These two sentences make the same claim about ${topic(shared)}, but one of them says "${a.negation || b.negation}". Keep one version.`,
          severity: 'medium',
          location: `${label(a.sentence)} · ${label(b.sentence)}`,
          start: a.sentence.start,
          end: a.sentence.end,
          related: [{ start: b.sentence.start, end: b.sentence.end }],
          repairs: [],
        });
      }

      if (issues.length === before && !oneIsNegated && a.words.length >= 5 && b.words.length >= 5) {
        const score = similarity(a.words, b.words);
        if (score >= 0.7) {
          issues.push({
            id: `repeat-${a.sentence.start}-${b.sentence.start}`,
            kind: 'redundancy',
            title: 'Repeated sentence',
            message: `${label(b.sentence)} repeats ${label(a.sentence).toLowerCase()} almost word for word (${Math.round(score * 100)}% the same).`,
            severity: 'low',
            location: `${label(a.sentence)} · ${label(b.sentence)}`,
            start: b.sentence.start,
            end: b.sentence.end,
            related: [{ start: a.sentence.start, end: a.sentence.end }],
            repairs: [{ label: 'Delete the repeat', start: b.sentence.start, end: b.sentence.end, text: '' }],
          });
        }
      }
    }
  }

  return {
    version: 'javascript',
    issues,
    stats: {
      sentences: sentences.length,
      words: wordsOf(text).length,
      numbers: prepared.reduce((total, item) => total + item.numbers.length, 0),
      checks: 3,
    },
  };
}
