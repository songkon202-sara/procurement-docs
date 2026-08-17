import type { CaseStatus } from '../types';

interface StatusInfo {
  label: string;
  bg: string;
  fg: string;
}

const CASE_STATUS: Record<CaseStatus, StatusInfo> = {
  draft: { label: 'ร่าง', bg: '#eef1f4', fg: '#5a6675' },
  submitted: { label: 'ส่งเรื่องแล้ว', bg: '#eef4fb', fg: '#1d5a94' },
  under_review: { label: 'กำลังตรวจสอบ', bg: '#fff4e5', fg: '#96591a' },
  approved: { label: 'อนุมัติแล้ว', bg: '#e7f3ec', fg: '#0f5132' },
  rejected: { label: 'ถูกตีกลับ', bg: '#fbeaea', fg: '#b4232a' },
  completed: { label: 'เสร็จสิ้น', bg: '#e7f3ec', fg: '#0f5132' },
  cancelled: { label: 'ยกเลิก', bg: '#f0f1f3', fg: '#8a96a3' },
};

export function caseStatusInfo(status: CaseStatus): StatusInfo {
  return CASE_STATUS[status] ?? CASE_STATUS.draft;
}

/** Cases in these statuses may still have their fields edited (PATCH /cases/:id draft-only guard). */
export const EDITABLE_STATUSES: readonly CaseStatus[] = ['draft'];

/** Cases in these statuses can be cancelled (mirrors backend TRANSITIONS.cancel.from). */
export const CANCELLABLE_STATUSES: readonly CaseStatus[] = ['draft', 'submitted'];
