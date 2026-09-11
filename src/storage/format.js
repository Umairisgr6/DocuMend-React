/**
 * format.js — small display helpers for stored timestamps.
 */

/** "today, 9:42 am" · "yesterday, 4:18 pm" · "jun 14, 2026" */
export function formatModified(ms) {
  const date = new Date(ms);
  const now = new Date();
  const time = date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase();

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (daysAgo === 0) return `today, ${time}`;
  if (daysAgo === 1) return `yesterday, ${time}`;
  return date
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toLowerCase();
}
