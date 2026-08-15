import { useRef, useState } from 'react';
import { catInfo } from '../lib/catInfo';
import { useApp } from '../state/store';

export function ProjectsModal() {
  const { state, closeProjects, saveProject, newProject, loadProject, deleteProject, exportBackup, importBackup } = useApp();
  const { projects, curProjectId, data } = state;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const sorted = [...projects].sort((a, b) => b.ts - a.ts);
  const curProjectName = projects.find((p) => p.id === curProjectId)?.name ?? 'ยังไม่ได้บันทึก';

  const handleSave = () => {
    const name = window.prompt('ตั้งชื่อโครงการ (สำหรับบันทึก/เรียกดูภายหลัง)', data.projectName || 'โครงการใหม่');
    if (!name) return;
    saveProject(name);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('ลบโครงการนี้?')) return;
    deleteProject(id);
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
            <div style={{ fontSize: 12, color: '#7a8794' }}>บันทึกไว้ {projects.length} โครงการ · กำลังทำ: {curProjectName}</div>
          </div>
          <button onClick={closeProjects} style={{ border: 'none', background: '#eef1f4', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 15, color: '#5a6675', fontFamily: "'Sarabun',sans-serif" }}>
            ✕
          </button>
        </div>
        <div style={{ padding: '11px 20px', display: 'flex', gap: 8, borderBottom: '1px solid #f0f2f5' }}>
          <button onClick={handleSave} style={{ border: 'none', background: '#1d8a5b', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            💾 บันทึกโครงการปัจจุบัน
          </button>
          <button onClick={newProject} style={{ border: '1px solid #c5cdd6', background: '#fff', color: '#33404d', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}>
            + เริ่มโครงการใหม่
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '10px 16px', flex: 1 }}>
          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9aa6b3', fontSize: 13, padding: '24px 12px' }}>
              ยังไม่มีโครงการที่บันทึกไว้ — กด “บันทึกโครงการปัจจุบัน” เพื่อเก็บชุดข้อมูลนี้ และเปิดใช้ภายหลังได้
            </div>
          )}
          {sorted.map((p) => (
            <div
              key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, border: '1px solid #eef1f4', marginBottom: 5, background: p.id === curProjectId ? '#eef6f0' : '#fff' }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#2a3543' }}>{p.name}</span>
                <span style={{ display: 'block', fontSize: 11, color: '#8a96a3' }}>{catInfo(p.category).label}</span>
              </span>
              <button
                onClick={() => loadProject(p.id)}
                style={{ border: '1px solid #1d3a5f', background: '#1d3a5f', color: '#fff', borderRadius: 7, padding: '5px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
              >
                เปิด
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                style={{ border: '1px solid #e0c3c3', background: '#fff', color: '#b4232a', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
              >
                ลบ
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: '11px 20px', borderTop: '1px solid #f0f2f5' }}>
          <div style={{ fontSize: 11, color: '#8a96a3', marginBottom: 7 }}>
            ข้อมูลทั้งหมดเก็บอยู่ในเครื่องนี้เท่านั้น — สำรองไฟล์ไว้กันข้อมูลหายหรือย้ายไปใช้เครื่องอื่น
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
