import type { LineItem } from '../../types';
import { useApp } from '../../state/store';

export function ItemsEditor({ items }: { items: LineItem[] }) {
  const { updateItem, addItem, removeItem } = useApp();

  return (
    <>
      {items.map((it, i) => (
        <div key={it.id} style={{ border: '1px solid #e2e7ee', borderRadius: 9, padding: 8, marginBottom: 7, background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7a8794' }}>รายการที่ {i + 1}</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => removeItem(it.id)}
              style={{ border: 'none', background: '#f6e6e6', color: '#b4232a', borderRadius: 6, padding: '3px 9px', fontSize: 11, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif" }}
            >
              ลบ
            </button>
          </div>
          <input
            value={it.name}
            onChange={(e) => updateItem(it.id, 'name', e.target.value)}
            placeholder="รายละเอียดรายการ"
            style={{ marginBottom: 5 }}
          />
          <div className="row">
            <input value={it.qty} onChange={(e) => updateItem(it.id, 'qty', e.target.value)} placeholder="จำนวน" />
            <input value={it.unit} onChange={(e) => updateItem(it.id, 'unit', e.target.value)} placeholder="หน่วย" />
            <input value={it.price} onChange={(e) => updateItem(it.id, 'price', e.target.value)} placeholder="ราคา/หน่วย" />
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        style={{ border: '1px dashed #9db2c8', background: '#f2f6fb', color: '#1d3a5f', borderRadius: 8, padding: 7, width: '100%', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif", marginBottom: 8 }}
      >
        + เพิ่มรายการ
      </button>
    </>
  );
}
