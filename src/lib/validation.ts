import { METERED_DOCS } from './docs';
import { fmt } from './format';
import { compareThaiDates } from './thaiDate';
import type { ProcurementData } from '../types';

export function numOf(v: string | undefined): number {
  return Number(String(v ?? '').replace(/[, ]/g, '')) || 0;
}

export function computeMissingFields(data: ProcurementData): string[] {
  const miss: string[] = [];
  if (!data.org) miss.push('ชื่อหน่วยงาน');
  if (!data.projectName) miss.push('ชื่อโครงการ');
  if (!data.amount) miss.push('วงเงิน');
  if (!data.vendorName) miss.push('คู่สัญญา');
  return miss;
}

const SPECIFIC_METHOD_THRESHOLD = 500000;

/**
 * Amount-consistency, legal-threshold, and document-sequence warnings — the checks a หน่วยตรวจสอบ
 * most commonly flags: VAT arithmetic, line-item totals, the ไม่เกิน 500,000 บาท ceiling for
 * วิธีเฉพาะเจาะจง (มาตรา 56(2)(ข)/(ค)), and เลขที่/วันที่ that don't run in chronological order.
 */
export function computeWarnings(data: ProcurementData, itemsTotal: number): string[] {
  const warns: string[] = [];
  const sub = numOf(data.orderSubtotal);
  const vat = numOf(data.orderVat);
  const amt = numOf(data.amount);

  if (amt && (sub || vat) && Math.abs(sub + vat - amt) > 0.5) {
    warns.push(
      `ยอดใบสั่ง (ก่อน VAT ${fmt(sub)} + VAT ${fmt(vat)} = ${fmt(sub + vat)}) ไม่เท่าวงเงินรวม ${fmt(amt)}`,
    );
  }
  if (sub && vat && Math.abs(vat - sub * 0.07) > 0.5) {
    warns.push(`ภาษีมูลค่าเพิ่ม (${fmt(vat)}) ไม่ตรงกับ 7% ของราคาก่อน VAT (${fmt(sub * 0.07)})`);
  }
  if (amt && itemsTotal && Math.abs(itemsTotal - amt) > 0.5) {
    warns.push(`ยอดรวมรายการ (${fmt(itemsTotal)}) ไม่เท่าวงเงิน ${fmt(amt)}`);
  }

  if (amt > SPECIFIC_METHOD_THRESHOLD && /มาตรา\s*56/.test(data.legalRef) && /เฉพาะเจาะจง/.test(data.method)) {
    warns.push(
      `วงเงิน ${fmt(amt)} บาท เกิน ${fmt(SPECIFIC_METHOD_THRESHOLD)} บาท แต่เอกสารอ้างวิธีเฉพาะเจาะจงตามมาตรา 56 วรรคหนึ่ง (2) ซึ่งใช้ได้เฉพาะวงเงินไม่เกิน ${fmt(SPECIFIC_METHOD_THRESHOLD)} บาท — ตรวจสอบวิธีจัดหา/มาตราที่อ้างอีกครั้ง`,
    );
  }

  let prevLabel: string | null = null;
  let prevDate: string | null = null;
  for (const m of METERED_DOCS) {
    const cur = data.docmeta[m.key];
    if (cur?.date) {
      if (prevDate) {
        const cmp = compareThaiDates(prevDate, cur.date);
        if (cmp !== null && cmp > 0) {
          warns.push(`วันที่ฉบับ "${m.label}" (${cur.date}) ย้อนก่อนฉบับ "${prevLabel}" (${prevDate}) — เลขที่/วันที่ไม่เรียงลำดับ`);
        }
      }
      prevLabel = m.label;
      prevDate = cur.date;
    }
  }

  return warns;
}
