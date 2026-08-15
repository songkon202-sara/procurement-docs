import { DOC_PHASES } from '../lib/docs';
import { useApp } from '../state/store';
import type { CatInfo } from '../lib/catInfo';

export function PreviewNav({ cat }: { cat: CatInfo }) {
  const { state, setActiveDoc } = useApp();

  const labelFor = (id: string, label: string) => {
    if (id === 'price') return `${cat.priceForm} ราคากลาง`;
    if (id === 'approve') return `ขออนุมัติ${cat.orderVerb}`;
    if (id === 'order') return cat.orderTitle;
    return label;
  };

  return (
    <div
      className="app-chrome"
      style={{ position: 'sticky', top: 0, zIndex: 3, background: '#eef1f4', borderBottom: '1px solid #d4dae1', padding: '9px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}
    >
      {DOC_PHASES.map((phase) => (
        <div key={phase.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#7a8794', width: 52, flexShrink: 0, textAlign: 'right', lineHeight: 1.15 }}>
            {phase.name}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
            {phase.items.map((d) => {
              const active = state.activeDoc === d.id;
              return (
                <button
                  key={d.id}
                  className="navbtn"
                  onClick={() => setActiveDoc(d.id)}
                  style={{
                    background: active ? '#1d3a5f' : '#fff',
                    color: active ? '#fff' : '#33404d',
                    borderColor: active ? '#1d3a5f' : '#d4dae1',
                  }}
                >
                  <span className="badge" style={{ background: active ? '#c79a3a' : '#e4e9ef', color: active ? '#1a1205' : '#5a6675' }}>
                    {d.no}
                  </span>
                  {labelFor(d.id, d.label)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
