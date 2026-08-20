import { useApp } from '../state/store';
import { useAuth } from '../state/auth';
import type { Category } from '../types';
import { DOC_LIST } from '../lib/docs';

const CATS: { key: Category; label: string }[] = [
  { key: 'purchase', label: 'จัดซื้อ' },
  { key: 'hire', label: 'จัดจ้าง' },
  { key: 'construction', label: 'จ้างก่อสร้าง' },
];

export function Header({ onDownloadWord }: { onDownloadWord: () => void }) {
  const { state, setCategory, setPrintScope, openReview, openProjects, doPrint } = useApp();
  const { user, logout } = useAuth();
  const curProjectName = state.caseId ? state.data.projectName || 'ยังไม่ได้บันทึก' : 'ยังไม่ได้บันทึก';

  return (
    <header
      className="app-chrome"
      style={{
        background: '#15293f',
        color: '#fff',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 60,
        flexShrink: 0,
        boxShadow: '0 2px 10px rgba(0,0,0,.25)',
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        <div
          style={{
            width: 30,
            height: 30,
            border: '2px solid #c79a3a',
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#c79a3a',
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          กท
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap' }}>ระบบเอกสารจัดซื้อจัดจ้างภาครัฐ</div>
          <div style={{ fontSize: 10.5, color: '#9fb1c6', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            ตาม พ.ร.บ. จัดซื้อจัดจ้างฯ พ.ศ. 2560 · {curProjectName}
          </div>
        </div>
      </div>
      <button
        onClick={openProjects}
        style={{
          border: 'none',
          cursor: 'pointer',
          padding: '7px 12px',
          borderRadius: 8,
          fontFamily: "'Sarabun',sans-serif",
          fontSize: 13,
          fontWeight: 600,
          background: '#0e1d2e',
          color: '#cdd8e4',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        📁 โครงการ
      </button>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', background: '#0e1d2e', borderRadius: 10, padding: 4, gap: 2 }}>
        {CATS.map((c) => {
          const active = state.category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '7px 15px',
                borderRadius: 7,
                fontFamily: "'Sarabun',sans-serif",
                fontSize: 14,
                fontWeight: 600,
                background: active ? '#1d3a5f' : 'transparent',
                color: active ? '#fff' : '#cdd8e4',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
        <select
          value={state.printScope}
          onChange={(e) => setPrintScope(e.target.value as 'current' | 'all')}
          style={{ padding: '7px 10px', borderRadius: 8, border: 'none', fontFamily: "'Sarabun',sans-serif", fontSize: 13, background: '#0e1d2e', color: '#cdd8e4' }}
        >
          <option value="current">พิมพ์: ฉบับนี้</option>
          <option value="all">พิมพ์: ทั้งชุด ({DOC_LIST.length} ฉบับ)</option>
        </select>
        <button
          onClick={openReview}
          style={{ border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 8, fontFamily: "'Sarabun',sans-serif", fontSize: 14, fontWeight: 600, background: '#26456b', color: '#fff' }}
        >
          ✓ ตรวจก่อนพิมพ์
        </button>
        <button
          onClick={onDownloadWord}
          style={{ border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, fontFamily: "'Sarabun',sans-serif", fontSize: 14, fontWeight: 600, background: '#2a527e', color: '#fff', whiteSpace: 'nowrap' }}
        >
          ⬇ Word
        </button>
        <button
          onClick={doPrint}
          style={{ border: 'none', cursor: 'pointer', padding: '8px 15px', borderRadius: 8, fontFamily: "'Sarabun',sans-serif", fontSize: 14, fontWeight: 700, background: '#c79a3a', color: '#1a1205', whiteSpace: 'nowrap' }}
        >
          🖨 พิมพ์ / PDF
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10, paddingLeft: 10, borderLeft: '1px solid #2a3d54' }}>
        <div style={{ fontSize: 12, color: '#cdd8e4', textAlign: 'right', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{user?.fullName}</div>
        <button
          onClick={logout}
          style={{ border: 'none', cursor: 'pointer', padding: '7px 11px', borderRadius: 8, fontFamily: "'Sarabun',sans-serif", fontSize: 12.5, fontWeight: 600, background: '#0e1d2e', color: '#cdd8e4', whiteSpace: 'nowrap' }}
        >
          ออกจากระบบ
        </button>
      </div>
    </header>
  );
}
