import type { CSSProperties, ReactNode } from 'react';
import type { PersonRow } from '../../types';

export function GarudaBox({
  url,
  size,
  variant,
}: {
  url: string | null;
  size: string;
  variant: 'sm' | 'lg';
}) {
  return (
    <div
      style={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {url ? (
        <img
          src={url}
          alt="ครุฑ"
          className={variant === 'sm' ? 'g-sm' : 'g-lg'}
          style={{ height: '100%', width: 'auto', maxWidth: '100%', display: 'block', objectFit: 'contain' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '1px dashed #aaa',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9pt',
            color: '#999',
            textAlign: 'center',
          }}
        >
          ตรา
          <br />
          ครุฑ
        </div>
      )}
    </div>
  );
}

export function MemoHeader({ garudaUrl }: { garudaUrl: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 4 }}>
      <GarudaBox url={garudaUrl} size="1.5cm" variant="sm" />
      <div style={{ flex: 1, textAlign: 'center', paddingTop: 8 }}>
        <span style={{ fontSize: '29pt', fontWeight: 700, letterSpacing: '.04em' }}>บันทึกข้อความ</span>
      </div>
      <div style={{ width: '1.5cm', flexShrink: 0 }} />
    </div>
  );
}

export function LetterheadMeta({
  orgFull,
  no,
  date,
  subject,
}: {
  orgFull: string;
  no: string;
  date: string;
  subject: ReactNode;
}) {
  return (
    <>
      <div className="dot">
        <b>ส่วนราชการ</b> {orgFull}
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }} className="dot">
        <div style={{ flex: 1 }}>
          <b>ที่</b> {no}
        </div>
        <div style={{ flex: '0 0 auto', whiteSpace: 'nowrap' }}>
          <b>วันที่</b> {date}
        </div>
      </div>
      <div className="dot" style={{ marginBottom: 10 }}>
        <b>เรื่อง</b> {subject}
      </div>
    </>
  );
}

export function PersonRows({
  people,
  margin,
  nameFlex,
  posFlex,
  gap,
}: {
  people: PersonRow[];
  margin: string;
  nameFlex: number;
  posFlex: number;
  gap?: string;
}) {
  return (
    <div style={{ margin }}>
      {people.map((m, i) => (
        <div key={m.id} style={{ display: 'flex', marginBottom: gap ?? 4 }}>
          <div style={{ width: '0.9cm' }}>{i + 1}</div>
          <div style={{ flex: nameFlex }}>{m.name}</div>
          <div style={{ flex: posFlex }}>ตำแหน่ง {m.pos}</div>
          <div style={{ flex: '0 0 auto', whiteSpace: 'nowrap', textAlign: 'right', paddingLeft: 10 }}>{m.role}</div>
        </div>
      ))}
    </div>
  );
}

export function SigColumn({
  people,
  signLabel = '(ลงชื่อ) ...........................',
  posPrefix = false,
}: {
  people: PersonRow[];
  signLabel?: string;
  posPrefix?: boolean;
}) {
  return (
    <div className="sig3">
      {people.map((m) => (
        <div key={m.id}>
          <div>{signLabel}</div>
          <div>( {m.name} )</div>
          <div style={{ fontSize: '14pt' }}>
            {posPrefix ? 'ตำแหน่ง ' : ''}
            {m.pos}
          </div>
          <div style={{ fontSize: '14pt' }}>{m.role}</div>
        </div>
      ))}
    </div>
  );
}

export function SignSingle({
  align = 'flex-end',
  width = '8.5cm',
  marginTop = 24,
  showSignLine = true,
  name,
  pos,
  roleLabel,
}: {
  align?: CSSProperties['justifyContent'];
  width?: string;
  marginTop?: number;
  showSignLine?: boolean;
  name: string;
  pos: string;
  roleLabel?: string;
}) {
  return (
    <div style={{ marginTop, display: 'flex', justifyContent: align }}>
      <div style={{ textAlign: 'center', width }}>
        {showSignLine && <div>(ลงชื่อ) ..........................................</div>}
        <div>( {name} )</div>
        <div>{pos}</div>
        {roleLabel && <div>{roleLabel}</div>}
      </div>
    </div>
  );
}

export function SignHeadPair({
  marginTop = 16,
  approver,
  leftNote,
  headOfficer,
  headOfficerPos,
  rightLabel,
}: {
  marginTop?: number;
  approver: string;
  leftNote: string;
  headOfficer: string;
  headOfficerPos: string;
  rightLabel: string;
}) {
  return (
    <div style={{ marginTop, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ textAlign: 'center', width: '48%' }}>
        <div style={{ textAlign: 'left' }}>เรียน {approver}</div>
        <div style={{ textAlign: 'left', marginBottom: 2 }}>{leftNote}</div>
        <div>(ลงชื่อ) ..............................</div>
        <div>( {headOfficer} )</div>
        <div>{headOfficerPos}</div>
        <div>ทำหน้าที่หัวหน้าเจ้าหน้าที่</div>
      </div>
      <div style={{ textAlign: 'center', width: '48%' }}>
        <div style={{ marginBottom: 2 }}>{rightLabel}</div>
        <div>(ลงชื่อ) ..............................</div>
        <div>( {headOfficer} )</div>
        <div>{headOfficerPos}</div>
        <div>ปฏิบัติราชการแทน {approver}</div>
      </div>
    </div>
  );
}
