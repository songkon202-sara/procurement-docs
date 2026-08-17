import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../state/store';
import { api, ApiError } from '../../lib/api';

interface ApiVendor {
  id: string;
  legalName: string;
  taxId: string;
  contactName: string | null;
  phone: string | null;
  address: string | null;
  isBlacklisted: boolean;
  blacklistReason: string | null;
}

/**
 * Replaces the old free-text "ชื่อร้าน/บริษัท" field with a search-and-pick control against
 * the backend's vendor master data (GET/POST /vendors). Picking a vendor sets data.vendorId —
 * the real FK the backend cares about — alongside the display fields (name/tax id/address/
 * phone) that still drive the rendered documents. Editing the name after a pick invalidates
 * vendorId, since a stale id pointing at a different vendor than what's displayed would be
 * worse than no id at all.
 */
export function VendorPicker() {
  const { state, updateField } = useApp();
  const { data } = state;
  const [query, setQuery] = useState(data.vendorName);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ApiVendor[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ApiVendor | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTaxId, setNewTaxId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // Tracks the last vendorName *this component* wrote, so the sync effect below can tell
  // "the case changed underneath us" apart from "the user is typing" (which also changes
  // data.vendorName, via updateField) — without this, every keystroke would trigger the
  // external-change branch and immediately close the dropdown before a search could fire.
  const lastWrittenRef = useRef(data.vendorName);

  // Keep the input text in sync when the loaded case changes underneath us (e.g. loadCase()).
  useEffect(() => {
    if (data.vendorName !== lastWrittenRef.current) {
      lastWrittenRef.current = data.vendorName;
      setQuery(data.vendorName);
      setOpen(false);
    }
  }, [data.vendorName]);

  // A case can arrive already linked to a vendor (loaded from the backend) without us ever
  // having fetched that vendor's own record — look it up by tax id (unique) so the blacklist
  // warning still shows without needing a GET /vendors/:id route.
  useEffect(() => {
    if (!data.vendorId || !data.vendorTaxId) {
      setSelectedDetail(null);
      return;
    }
    let cancelled = false;
    api
      .get<ApiVendor[]>(`/vendors?search=${encodeURIComponent(data.vendorTaxId)}`)
      .then((rows) => {
        if (!cancelled) setSelectedDetail(rows.find((r) => r.id === data.vendorId) ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [data.vendorId, data.vendorTaxId]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      api
        .get<ApiVendor[]>(`/vendors?search=${encodeURIComponent(query.trim())}`)
        .then(setResults)
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, open]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const applyVendor = (v: ApiVendor) => {
    updateField('vendorId', v.id);
    updateField('vendorName', v.legalName);
    updateField('vendorTaxId', v.taxId);
    if (v.address) updateField('vendorAddr', v.address);
    if (v.phone) updateField('vendorPhone', v.phone);
    if (v.contactName) updateField('vendorRep', v.contactName);
    setSelectedDetail(v);
    lastWrittenRef.current = v.legalName;
    setQuery(v.legalName);
    setOpen(false);
    setCreating(false);
  };

  const handleChange = (v: string) => {
    lastWrittenRef.current = v;
    setQuery(v);
    updateField('vendorName', v);
    if (data.vendorId) updateField('vendorId', '');
    setOpen(true);
    setCreating(false);
    setError(null);
  };

  const handleCreate = async () => {
    setError(null);
    if (!/^\d{13}$/.test(newTaxId)) {
      setError('เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');
      return;
    }
    if (!query.trim()) {
      setError('ต้องระบุชื่อผู้ขาย/ผู้รับจ้าง');
      return;
    }
    try {
      const v = await api.post<ApiVendor>('/vendors', { legalName: query.trim(), taxId: newTaxId });
      applyVendor(v);
      setNewTaxId('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'เพิ่มผู้ขายไม่สำเร็จ');
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <label>
        <span>ชื่อร้าน/บริษัท (คู่สัญญา)</span>
        <input value={query} onChange={(e) => handleChange(e.target.value)} placeholder="พิมพ์ค้นหาผู้ขาย/ผู้รับจ้าง..." />
      </label>
      <div style={{ fontSize: 11, marginTop: -6, marginBottom: 10, color: data.vendorId ? '#0f5132' : '#96591a' }}>
        {data.vendorId ? '✓ ผูกกับผู้ขายในระบบแล้ว' : '⚠ ยังไม่ได้เลือกจากรายชื่อผู้ขายในระบบ — พิมพ์ค้นหาด้านบนเพื่อเลือก'}
      </div>

      {selectedDetail?.isBlacklisted && (
        <div
          style={{ fontSize: 12, color: '#b4232a', background: '#fbeaea', border: '1px solid #e0c3c3', borderRadius: 8, padding: '8px 10px', marginTop: -4, marginBottom: 10 }}
        >
          ⚠ ผู้ขายรายนี้อยู่ในบัญชีผู้ทิ้งงาน (มาตรา 109){selectedDetail.blacklistReason ? `: ${selectedDetail.blacklistReason}` : ''} — ตรวจสอบก่อนดำเนินการ
        </div>
      )}

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            background: '#fff',
            border: '1px solid #d4dae1',
            borderRadius: 8,
            boxShadow: '0 8px 20px rgba(0,0,0,.14)',
            maxHeight: 240,
            overflowY: 'auto',
            marginTop: -4,
            marginBottom: 10,
          }}
        >
          {results.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => applyVendor(v)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid #f0f2f5',
                background: v.isBlacklisted ? '#fbeaea' : '#fff',
                padding: '8px 10px',
                cursor: 'pointer',
                fontFamily: "'Sarabun',sans-serif",
              }}
            >
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: v.isBlacklisted ? '#b4232a' : '#2a3543' }}>
                {v.legalName} {v.isBlacklisted ? '⚠ ผู้ทิ้งงาน' : ''}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: '#8a96a3' }}>{v.taxId}</span>
            </button>
          ))}

          {results.length === 0 && !creating && (
            <div style={{ padding: '9px 10px' }}>
              <div style={{ fontSize: 12, color: '#8a96a3', marginBottom: 7 }}>ไม่พบผู้ขายนี้ในระบบ</div>
              <button
                type="button"
                onClick={() => setCreating(true)}
                style={{ border: '1px solid #1d8a5b', background: '#fff', color: '#1d8a5b', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
              >
                + เพิ่ม "{query.trim()}" เป็นผู้ขายใหม่
              </button>
            </div>
          )}

          {creating && (
            <div style={{ padding: '9px 10px' }}>
              <input
                value={newTaxId}
                onChange={(e) => setNewTaxId(e.target.value)}
                placeholder="เลขผู้เสียภาษี 13 หลัก"
                style={{ width: '100%', boxSizing: 'border-box', padding: '7px 9px', borderRadius: 7, border: '1px solid #c5cdd6', fontFamily: "'Sarabun',sans-serif", fontSize: 12.5, marginBottom: 6 }}
              />
              {error && <div style={{ fontSize: 11, color: '#b4232a', marginBottom: 6 }}>⚠ {error}</div>}
              <button
                type="button"
                onClick={() => void handleCreate()}
                style={{ border: 'none', background: '#1d8a5b', color: '#fff', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
              >
                บันทึกผู้ขายใหม่
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
