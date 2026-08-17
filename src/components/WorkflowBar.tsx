import { useState } from 'react';
import { useApp } from '../state/store';
import { useAuth } from '../state/auth';
import { caseStatusInfo } from '../lib/caseStatus';
import type { CaseStatus, RoleCode } from '../types';

interface ActionDef {
  action: string;
  label: string;
  from: CaseStatus[];
  roles: RoleCode[];
  requireOwner?: boolean;
  requireComment?: boolean;
  danger?: boolean;
}

/**
 * Mirrors backend/src/domain/workflow.ts's TRANSITIONS table — same statuses, roles, ownership
 * and comment requirements — purely to decide which buttons to show. The backend re-checks
 * every one of these itself and is the actual authority; this table only saves the user a
 * click on an action that would just come back as a 403/409 anyway.
 */
const ACTIONS: ActionDef[] = [
  { action: 'submit', label: 'ส่งเรื่อง', from: ['draft'], roles: ['procurement_officer'], requireOwner: true },
  { action: 'review_pass', label: 'ตรวจสอบผ่าน', from: ['submitted'], roles: ['auditor'] },
  { action: 'review_reject', label: 'ตีกลับ (ผู้ตรวจสอบ)', from: ['submitted'], roles: ['auditor'], requireComment: true, danger: true },
  { action: 'approve', label: 'อนุมัติ', from: ['under_review'], roles: ['approver'] },
  { action: 'reject', label: 'ตีกลับ (ไม่อนุมัติ)', from: ['under_review'], roles: ['approver'], requireComment: true, danger: true },
  { action: 'reopen', label: 'แก้ไขแล้วส่งใหม่', from: ['rejected'], roles: ['procurement_officer'], requireOwner: true },
  { action: 'complete', label: 'ปิดเรื่อง (เสร็จสิ้น)', from: ['approved'], roles: ['procurement_officer', 'admin'] },
  { action: 'cancel', label: 'ยกเลิกเรื่อง', from: ['draft', 'submitted'], roles: ['procurement_officer', 'admin'], requireOwner: true, danger: true },
];

export function WorkflowBar() {
  const { state, performCaseAction } = useApp();
  const { user } = useAuth();
  const [busyAction, setBusyAction] = useState<string | null>(null);

  if (!state.caseId || !state.caseStatus) return null;

  const status = state.caseStatus;
  const available = ACTIONS.filter(
    (def) =>
      def.from.includes(status) &&
      def.roles.some((r) => user?.roles.includes(r)) &&
      (!def.requireOwner || state.caseOwnerId === user?.id),
  );

  const handleClick = async (def: ActionDef) => {
    let comment: string | undefined;
    if (def.requireComment) {
      const entered = window.prompt(`ระบุเหตุผลประกอบการ "${def.label}"`);
      if (!entered?.trim()) return;
      comment = entered.trim();
    } else if (def.danger && !window.confirm(`ยืนยัน "${def.label}"?`)) {
      return;
    }
    setBusyAction(def.action);
    await performCaseAction(def.action, comment);
    setBusyAction(null);
  };

  const info = caseStatusInfo(status);

  return (
    <div
      className="app-chrome"
      style={{ background: '#1d2b3e', color: '#cdd8e4', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, borderBottom: '1px solid #2a3d54' }}
    >
      <span style={{ fontSize: 12, fontWeight: 600 }}>สถานะเรื่อง:</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: info.fg, background: info.bg, borderRadius: 6, padding: '3px 10px' }}>{info.label}</span>
      <div style={{ flex: 1 }} />
      {available.length === 0 && <span style={{ fontSize: 12, color: '#7a8aa0' }}>ไม่มีการดำเนินการที่ทำได้ในสถานะนี้สำหรับบทบาทของคุณ</span>}
      {available.map((def) => (
        <button
          key={def.action}
          disabled={busyAction !== null}
          onClick={() => void handleClick(def)}
          style={{
            border: 'none',
            cursor: busyAction ? 'default' : 'pointer',
            opacity: busyAction && busyAction !== def.action ? 0.5 : 1,
            padding: '6px 14px',
            borderRadius: 7,
            fontFamily: "'Sarabun',sans-serif",
            fontSize: 12.5,
            fontWeight: 700,
            background: def.danger ? '#7a2530' : '#c79a3a',
            color: def.danger ? '#fff' : '#1a1205',
            whiteSpace: 'nowrap',
          }}
        >
          {busyAction === def.action ? 'กำลังดำเนินการ...' : def.label}
        </button>
      ))}
    </div>
  );
}
