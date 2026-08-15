/** Formats a numeric string as a thousands-separated number (up to 2 decimals). */
export function fmt(n: string | number | undefined): string {
  const v = Number(String(n ?? '').replace(/[, ]/g, ''));
  if (Number.isNaN(v)) return String(n ?? '');
  return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const DIGIT_WORDS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const PLACE_WORDS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

function spellChunk(digits: string): string {
  let out = '';
  const len = digits.length;
  for (let i = 0; i < len; i++) {
    const d = Number(digits[i]);
    const pos = len - i - 1;
    if (d === 0) continue;
    if (pos === 0) {
      out += d === 1 && len > 1 ? 'เอ็ด' : DIGIT_WORDS[d];
    } else if (pos === 1) {
      out += d === 1 ? 'สิบ' : d === 2 ? 'ยี่สิบ' : DIGIT_WORDS[d] + 'สิบ';
    } else {
      out += DIGIT_WORDS[d] + PLACE_WORDS[pos];
    }
  }
  return out;
}

function spellNumber(digits: string): string {
  if (digits.length > 6) {
    return spellNumber(digits.slice(0, digits.length - 6)) + 'ล้าน' + spellChunk(digits.slice(digits.length - 6));
  }
  return spellChunk(digits);
}

/** Full Thai baht-text spellout, e.g. 2910 -> "สองพันเก้าร้อยสิบบาทถ้วน". */
export function bahtText(input: string | number | undefined): string {
  let n = Number(String(input ?? '').replace(/[, ]/g, ''));
  if (Number.isNaN(n)) return '';
  if (n === 0) return 'ศูนย์บาทถ้วน';
  n = Math.round(n * 100) / 100;
  const intPart = Math.floor(n);
  const satang = Math.round((n - intPart) * 100);
  const baht = spellNumber(String(intPart));
  if (satang === 0) return baht + 'บาทถ้วน';
  return baht + 'บาท' + spellChunk(String(satang)) + 'สตางค์';
}
