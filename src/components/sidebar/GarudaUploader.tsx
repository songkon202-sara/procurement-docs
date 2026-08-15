export function GarudaUploader({
  label,
  placeholderLines,
  url,
  onUpload,
  onClear,
}: {
  label: string;
  placeholderLines: [string, string];
  url: string | null;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
      <div
        style={{
          width: 52,
          height: 52,
          border: '1px dashed #c5cdd6',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#f6f8fa',
          flexShrink: 0,
        }}
      >
        {url ? (
          <img src={url} alt="ครุฑ" style={{ height: '100%', width: 'auto', maxWidth: '100%', display: 'block', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: 9, color: '#9aa6b3', textAlign: 'center' }}>
            {placeholderLines[0]}
            <br />
            {placeholderLines[1]}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#3a4654', marginBottom: 4 }}>{label}</div>
        <label style={{ display: 'inline-block', cursor: 'pointer', padding: '6px 11px', background: '#1d3a5f', color: '#fff', borderRadius: 7, fontSize: 12, fontWeight: 600, margin: 0 }}>
          อัปโหลด
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />
        </label>
        <button
          onClick={onClear}
          style={{ marginLeft: 6, border: '1px solid #c5cdd6', background: '#fff', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#64707d', fontFamily: "'Sarabun',sans-serif" }}
        >
          ลบ
        </button>
      </div>
    </div>
  );
}
