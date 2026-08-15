/** Increments the trailing run of digits in a document number, e.g. "อบ 2733.1/3.1.1/85" -> "...86". */
export function nextNo(base: string, step: number): string {
  const s = String(base ?? '');
  const m = s.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return s;
  const n = parseInt(m[2], 10) + step;
  return `${m[1]}${n}${m[3]}`;
}
