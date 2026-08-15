import { DOC_LIST, getDocMeta } from '../lib/docs';
import { computeMissingFields, computeWarnings } from '../lib/validation';
import { useApp } from '../state/store';
import type { DocViewModel } from '../lib/viewModel';

export function ReviewModal({ vm }: { vm: DocViewModel }) {
  const { state, closeReview, setAllPrint, togglePrintDoc, jumpDoc, reviewPrint } = useApp();
  const { data, printSet } = state;

  const missing = computeMissingFields(data);
  const warnings = computeWarnings(data, vm.itemsTotal);
  const reviewCount = DOC_LIST.filter((d) => printSet[d.id] !== false).length;

  return (
    <div
      className="app-chrome"
      onClick={closeReview}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,40,.55)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, width: 580, maxWidth: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.35)', fontFamily: "'Sarabun',sans-serif" }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e7ee', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#15293f' }}>ตรวจสอบเอกสารก่อนพิมพ์</div>
            <div style={{ fontSize: 12, color: '#7a8794' }}>เลือกฉบับที่ต้องการพิมพ์ · เลือกแล้ว {reviewCount} ฉบับ</div>
          </div>
          <button onClick={closeReview} style={{ border: 'none', background: '#eef1f4', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 15, color: '#5a6675', fontFamily: "'Sarabun',sans-serif" }}>
            ✕
          </button>
        </div>
        <div style={{ padding: '9px 20px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f2f5' }}>
          <button onClick={() => setAllPrint(true)} style={{ border: '1px solid #d4dae1', background: '#fff', color: '#33404d', borderRadius: 7, padding: '5px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            เลือกทั้งหมด
          </button>
          <button onClick={() => setAllPrint(false)} style={{ border: '1px solid #d4dae1', background: '#fff', color: '#33404d', borderRadius: 7, padding: '5px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            ไม่เลือก
          </button>
          {missing.length > 0 && (
            <div style={{ flex: 1, textAlign: 'right', fontSize: 11, color: '#b4232a' }}>⚠ ยังไม่ได้กรอก: {missing.join(', ')}</div>
          )}
        </div>
        {warnings.length > 0 && (
          <div style={{ margin: '10px 16px 0', background: '#fff4e5', border: '1px solid #f0cf9b', borderRadius: 9, padding: '9px 11px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#96591a', marginBottom: 4 }}>⚠ ตรวจพบความไม่สอดคล้อง (ควรตรวจก่อนพิมพ์)</div>
            {warnings.map((w) => (
              <div key={w} style={{ fontSize: 12, color: '#7a4f16', lineHeight: 1.5 }}>
                • {w}
              </div>
            ))}
          </div>
        )}
        <div style={{ overflowY: 'auto', padding: '8px 14px', flex: 1 }}>
          {DOC_LIST.map((d) => {
            const meta = getDocMeta(data, d.id);
            const inc = printSet[d.id] !== false;
            return (
              <label
                key={d.id}
                onClick={() => togglePrintDoc(d.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px', borderRadius: 9, cursor: 'pointer', background: inc ? '#f3f9f5' : '#fff', marginBottom: 3, border: '1px solid #eef1f4' }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    border: `2px solid ${inc ? '#1d8a5b' : '#c5cdd6'}`,
                    background: inc ? '#1d8a5b' : '#fff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {inc ? '✓' : ''}
                </span>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#eef1f4', color: '#5a6675', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {d.no}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#2a3543' }}>{d.label}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#8a96a3' }}>
                    {meta?.no ?? ''} {meta?.date ?? ''}
                  </span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpDoc(d.id);
                  }}
                  style={{ border: '1px solid #d4dae1', background: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#1d3a5f', cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
                >
                  ดู
                </button>
              </label>
            );
          })}
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e7ee', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={closeReview} style={{ border: '1px solid #c5cdd6', background: '#fff', color: '#5a6675', borderRadius: 9, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            ยกเลิก
          </button>
          <button onClick={reviewPrint} style={{ border: 'none', background: '#c79a3a', color: '#1a1205', borderRadius: 9, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            🖨 พิมพ์ {reviewCount} ฉบับ
          </button>
        </div>
      </div>
    </div>
  );
}
