export type CaseStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type ApprovalAction =
  | 'submit'
  | 'review_pass'
  | 'review_reject'
  | 'approve'
  | 'reject'
  | 'reopen'
  | 'complete'
  | 'cancel';

export type RoleCode = 'procurement_officer' | 'auditor' | 'approver' | 'admin' | 'viewer';

interface TransitionRule {
  from: CaseStatus[];
  to: CaseStatus;
  allowedRoles: RoleCode[];
  /** actor ต้องเป็นเจ้าของเรื่อง (ownerId) ไม่ใช่แค่มี role ที่ถูกต้อง */
  requireOwner?: boolean;
  /** บังคับกรอกเหตุผลประกอบ (เช่น ตีกลับ) */
  requireComment?: boolean;
  /** ต้องผ่าน validateCase() ก่อนอนุญาตให้ทำรายการ */
  requireValidation?: boolean;
}

/**
 * Single source of truth ของ workflow ทั้งระบบ — เพิ่ม/แก้ transition ที่จุดนี้จุดเดียว
 * ไม่กระจายไปเขียนเป็น if/else ในแต่ละ route handler.
 *
 * 'admin' จงใจไม่ใส่ในทุก action — ใส่เฉพาะงานธุรการ (complete/cancel) ไม่ใส่ใน approve
 * เพื่อไม่ให้ admin เซ็นอนุมัติแทนคนที่มีอำนาจจริงได้ (ทำลาย audit trail ว่าใครอนุมัติจริง)
 */
export const TRANSITIONS: Record<ApprovalAction, TransitionRule> = {
  submit: {
    from: ['draft'],
    to: 'submitted',
    allowedRoles: ['procurement_officer'],
    requireOwner: true,
    requireValidation: true,
  },
  review_pass: {
    from: ['submitted'],
    to: 'under_review',
    allowedRoles: ['auditor'],
  },
  review_reject: {
    from: ['submitted'],
    to: 'rejected',
    allowedRoles: ['auditor'],
    requireComment: true,
  },
  approve: {
    from: ['under_review'],
    to: 'approved',
    allowedRoles: ['approver'],
  },
  reject: {
    from: ['under_review'],
    to: 'rejected',
    allowedRoles: ['approver'],
    requireComment: true,
  },
  reopen: {
    from: ['rejected'],
    to: 'draft',
    allowedRoles: ['procurement_officer'],
    requireOwner: true,
  },
  complete: {
    from: ['approved'],
    to: 'completed',
    allowedRoles: ['procurement_officer', 'admin'],
  },
  cancel: {
    from: ['draft', 'submitted'],
    to: 'cancelled',
    allowedRoles: ['procurement_officer', 'admin'],
    requireOwner: true,
  },
};
