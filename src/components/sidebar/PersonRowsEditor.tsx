import type { PersonRow } from '../../types';
import { useApp } from '../../state/store';

export function PersonRowsEditor({
  kind,
  people,
  addLabel,
}: {
  kind: 'committee' | 'inspectors';
  people: PersonRow[];
  addLabel: string;
}) {
  const { updateMember, addMember, removeMember } = useApp();

  return (
    <>
      {people.map((m, i) => (
        <div key={m.id} style={{ border: '1px solid #e2e7ee', borderRadius: 9, padding: 8, marginBottom: 7, background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7a8794' }}>คนที่ {i + 1}</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => removeMember(kind, m.id)}
              style={{ border: 'none', background: '#f6e6e6', color: '#b4232a', borderRadius: 6, padding: '3px 9px', fontSize: 11, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
            >
              ลบ
            </button>
          </div>
          <input
            value={m.name}
            onChange={(e) => updateMember(kind, m.id, 'name', e.target.value)}
            placeholder="ชื่อ-สกุล"
            style={{ marginBottom: 5 }}
          />
          <div className="row">
            <input value={m.pos} onChange={(e) => updateMember(kind, m.id, 'pos', e.target.value)} placeholder="ตำแหน่ง" />
            <input value={m.role} onChange={(e) => updateMember(kind, m.id, 'role', e.target.value)} placeholder="บทบาท" />
          </div>
        </div>
      ))}
      <button
        onClick={() => addMember(kind)}
        style={{ border: '1px dashed #9db2c8', background: '#f2f6fb', color: '#1d3a5f', borderRadius: 8, padding: 7, width: '100%', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif", marginBottom: 4 }}
      >
        {addLabel}
      </button>
    </>
  );
}
