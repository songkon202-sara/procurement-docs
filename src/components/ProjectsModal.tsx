import { useEffect, useRef, useState } from 'react';
import { catInfo } from '../lib/catInfo';
import { useApp } from '../state/store';
import { api, ApiError } from '../lib/api';
import type { ApiCase } from '../lib/caseMapping';
import { caseStatusInfo, CANCELLABLE_STATUSES } from '../lib/caseStatus';
import type { Category } from '../types';

export function ProjectsModal() {
  const { state, closeProjects, newCase, saveCase, loadCase, cancelCase, exportBackup, importBackup } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [cases, setCases] = useState<ApiCase[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    setListError(null);
    try {
      const rows = await api.get<ApiCase[]>('/cases?mine=true');
      setCases(rows);
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'โหลดรายการโครงการไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const sorted = [...cases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const curCaseName = cases.find((c) => c.id === state.caseId)?.projectName ?? (state.caseId ? state.data.projectName : 'ยังไม่ได้บันทึก');

  const handleSave = async () => {
    await saveCase();
    await refresh();
  };

  const handleOpen = async (id: string) => {
    setBusyId(id);
    await loadCase(id);
    setBusyId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยกเลิกโครงการนี้? (ทำได้เฉพาะโครงการที่ยังเป็นสถานะร่างหรือส่งเรื่องแล้วเท่านั้น)')) return;
    setBusyId(id);
    await cancelCase(id);
    await refresh();
    setBusyId(null);
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      if (!window.confirm('นำเข้าไฟล์สำรองจะเขียนทับข้อมูล โครงการ และตราครุฑปัจจุบันทั้งหมด ยืนยันหรือไม่?')) return;
      await importBackup(file);
    } catch {
      setImportError('ไฟล์สำรองไม่ถูกต้อง หรือเสียหาย');
    }
  };

  return (
    <div
      className="app-chrome"
      onClick={closeProjects}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,40,.55)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, width: 560, maxWidth: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.35)', fontFamily: "'Sarabun',sans-serif" }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e7ee', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#15293f' }}>โครงการจัดซื้อจัดจ้าง</div>
            <div style={{ fontSize: 12, color: '#7a8794' }}>บันทึกไว้ {cases.length} โครงการ · กำลังทำ: {curCaseName}</div>
          </div>
          <button onClick={closeProjects} style={{ border: 'none', background: '#eef1f4', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 15, color: '#5a6675', fontFamily: "'Sarabun',sans-serif" }}>
            ✕
          </button>
        </div>
        <div style={{ padding: '11px 20px', display: 'flex', gap: 8, borderBottom: '1px solid #f0f2f5' }}>
          <button onClick={() => void handleSave()} style={{ border: 'none', background: '#1d8a5b', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            💾 บันทึกโครงการปัจจุบัน
          </button>
          <button onClick={newCase} style={{ border: '1px solid #c5cdd6', background: '#fff', color: '#33404d', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            + เริ่มโครงการใหม่
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '10px 16px', flex: 1 }}>
          {loading && <div style={{ textAlign: 'center', color: '#9aa6b3', fontSize: 13, padding: '24px 12px' }}>กำลังโหลด...</div>}
          {listError && (
            <div style={{ fontSize: 12.5, color: '#b4232a', background: '#fbeaea', border: '1px solid #e0c3c3', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
              ⚠ {listError}
            </div>
          )}
          {!loading && !listError && sorted.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9aa6b3', fontSize: 13, padding: '24px 12px' }}>
              ยังไม่มีโครงการที่บันทึกไว้ — กด "บันทึกโครงการปัจจุบัน" เพื่อเก็บชุดข้อมูลนี้ และเปิดใช้ภายหลังได้
            </div>
          )}
          {sorted.map((c) => {
            const status = caseStatusInfo(c.status);
            const canCancel = CANCELLABLE_STATUSES.includes(c.status);
            const busy = busyId === c.id;
            return (
              <div
                key={c.id}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, border: '1px solid #eef1f4', marginBottom: 5, background: c.id === state.caseId ? '#eef6f0' : '#fff' }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#2a3543' }}>{c.projectName}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: '#8a96a3' }}>{catInfo(c.category as Category).label}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: status.fg, background: status.bg, borderRadius: 5, padding: '1px 7px' }}>
                      {status.label}
                    </span>
                  </span>
                </span>
                <button
                  disabled={busy}
                  onClick={() => void handleOpen(c.id)}
                  style={{ border: '1px solid #1d3a5f', background: '#1d3a5f', color: '#fff', borderRadius: 7, padding: '5px 13px', fontSize: 12, fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, fontFamily: "'Sarabun',sans-serif" }}
                >
                  เปิด
                </button>
                <button
                  disabled={busy || !canCancel}
                  title={canCancel ? undefined : 'ยกเลิกได้เฉพาะโครงการสถานะร่างหรือส่งเรื่องแล้ว'}
                  onClick={() => void handleDelete(c.id)}
                  style={{
                    border: '1px solid #e0c3c3',
                    background: '#fff',
                    color: '#b4232a',
                    borderRadius: 7,
                    padding: '5px 10px',
                    fontSize: 12,
                    cursor: busy || !canCancel ? 'default' : 'pointer',
                    opacity: busy || !canCancel ? 0.4 : 1,
                    fontFamily: "'Sarabun',sans-serif",
                  }}
                >
                  ลบ
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '11px 20px', borderTop: '1px solid #f0f2f5' }}>
          <div style={{ fontSize: 11, color: '#8a96a3', marginBottom: 7 }}>
            โครงการเก็บอยู่บนระบบกลางแล้ว — ปุ่มด้านล่างนี้ไว้สำรอง/ย้ายข้อมูลฟอร์มปัจจุบันเป็นไฟล์เสริมเท่านั้น
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => void exportBackup()}
              style={{ border: '1px solid #c5cdd6', background: '#fff', color: '#33404d', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
            >
              ⬇ ส่งออกข้อมูลสำรอง (.json)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '1px solid #c5cdd6', background: '#fff', color: '#33404d', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
            >
              ⬆ นำเข้าไฟล์สำรอง
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImportFile(f);
                e.target.value = '';
              }}
            />
          </div>
          {importError && <div style={{ fontSize: 11, color: '#b4232a', marginTop: 6 }}>⚠ {importError}</div>}
        </div>
      </div>
    </div>
  );
}
