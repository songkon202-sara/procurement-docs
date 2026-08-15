import type { CSSProperties, ReactNode } from 'react';

export function TextField({
  label,
  value,
  onChange,
  flex,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  flex?: CSSProperties['flex'];
  placeholder?: string;
}) {
  return (
    <label style={flex !== undefined ? { flex } : undefined}>
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label>
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="row">{children}</div>;
}
