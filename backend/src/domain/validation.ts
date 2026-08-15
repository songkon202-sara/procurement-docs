/**
 * Ported from the frontend's src/lib/validation.ts. Two changes from the original:
 * - the 500,000-baht threshold check is a hard `errors` block here (was a soft warning in the
 *   client-only app) since procurement_cases.threshold_override_reason now gives officers a
 *   documented way to proceed instead of silently ignoring the warning
 * - VAT/sequence checks stay as `warnings`: they don't block submission, but performAction()
 *   attaches them to the case_approvals comment so the audit trail shows the officer saw them
 */

const SPECIFIC_METHOD_THRESHOLD = 500_000;

export interface CaseForValidation {
  projectName: string;
  method: string;
  legalRef: string;
  amount: number;
  vendorId: string | null;
  thresholdOverrideReason: string | null;
  formData: { orderSubtotal?: string; orderVat?: string };
}

export function validateCase(k: CaseForValidation): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!k.projectName) errors.push('ยังไม่ระบุชื่อโครงการ');
  if (!k.vendorId) errors.push('ยังไม่เลือกคู่สัญญา (ผู้ขาย/ผู้รับจ้าง)');
  if (k.amount <= 0) errors.push('วงเงินต้องมากกว่า 0');

  if (
    k.amount > SPECIFIC_METHOD_THRESHOLD &&
    /เฉพาะเจาะจง/.test(k.method) &&
    /มาตรา\s*56/.test(k.legalRef) &&
    !k.thresholdOverrideReason
  ) {
    errors.push(
      `วงเงิน ${k.amount.toLocaleString('th-TH')} บาท เกิน 500,000 บาท แต่ยังอ้างวิธีเฉพาะเจาะจงตามมาตรา 56 ` +
        'โดยไม่มีเหตุผลรองรับ — กรอกเหตุผล (threshold_override_reason) ก่อนส่งเรื่อง',
    );
  }

  const sub = Number(k.formData.orderSubtotal ?? 0);
  const vat = Number(k.formData.orderVat ?? 0);
  if (sub && vat && Math.abs(vat - sub * 0.07) > 0.5) {
    warnings.push(`ภาษีมูลค่าเพิ่ม (${vat}) ไม่ตรงกับ 7% ของราคาก่อน VAT (${(sub * 0.07).toFixed(2)})`);
  }

  return { errors, warnings };
}
