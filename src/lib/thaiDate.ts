/** Parsing/formatting for the free-text Thai Buddhist-era dates used throughout the form (e.g. "16 เมษายน พ.ศ. 2569"). */

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const DATE_RE = /(\d{1,2})\s+([ก-๙]+)\s+(?:พ\.?ศ\.?\s*)?(\d{4})/;

/** Parses "D เดือน พ.ศ. YYYY" (Buddhist era) into a JS Date, or null if the text doesn't match. */
export function parseThaiDate(text: string): Date | null {
  const m = String(text ?? '').match(DATE_RE);
  if (!m) return null;
  const day = Number(m[1]);
  const monthIdx = THAI_MONTHS.indexOf(m[2]);
  const beYear = Number(m[3]);
  if (monthIdx < 0 || !day || !beYear) return null;
  const gregorianYear = beYear - 543;
  const date = new Date(Date.UTC(gregorianYear, monthIdx, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a JS Date back into "D เดือน พ.ศ. YYYY", matching the form's date style. */
export function formatThaiDate(date: Date): string {
  const day = date.getUTCDate();
  const month = THAI_MONTHS[date.getUTCMonth()];
  const beYear = date.getUTCFullYear() + 543;
  return `${day} ${month} พ.ศ. ${beYear}`;
}

/** Adds `days` to a Thai date string and returns the formatted result, or null if the input didn't parse. */
export function addDaysToThaiDate(text: string, days: number): string | null {
  const base = parseThaiDate(text);
  if (!base || !Number.isFinite(days)) return null;
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + Math.round(days));
  return formatThaiDate(result);
}

/** -1 / 0 / 1 like a normal comparator, or null if either date fails to parse (so callers can skip the check). */
export function compareThaiDates(a: string, b: string): number | null {
  const da = parseThaiDate(a);
  const db = parseThaiDate(b);
  if (!da || !db) return null;
  if (da.getTime() === db.getTime()) return 0;
  return da.getTime() < db.getTime() ? -1 : 1;
}
