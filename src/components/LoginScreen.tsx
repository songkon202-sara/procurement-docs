import { useState, type FormEvent } from 'react';
import { useAuth } from '../state/auth';
import { ApiError } from '../lib/api';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="app-chrome"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0e1d2e',
        fontFamily: "'Sarabun',sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 14,
          width: 380,
          maxWidth: '90%',
          padding: '28px 26px',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: '2px solid #c79a3a',
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#c79a3a',
            fontSize: 17,
            margin: '0 auto 14px',
          }}
        >
          กท
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#15293f', textAlign: 'center' }}>
          ระบบเอกสารจัดซื้อจัดจ้างภาครัฐ
        </div>
        <div style={{ fontSize: 12, color: '#7a8794', textAlign: 'center', marginBottom: 22 }}>เข้าสู่ระบบด้วยบัญชีที่ได้รับ</div>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#33404d', marginBottom: 4 }}>อีเมล</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '9px 11px',
            borderRadius: 8,
            border: '1px solid #d4dae1',
            fontFamily: "'Sarabun',sans-serif",
            fontSize: 14,
            marginBottom: 14,
          }}
        />

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#33404d', marginBottom: 4 }}>รหัสผ่าน</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '9px 11px',
            borderRadius: 8,
            border: '1px solid #d4dae1',
            fontFamily: "'Sarabun',sans-serif",
            fontSize: 14,
            marginBottom: 18,
          }}
        />

        {error && (
          <div style={{ fontSize: 12.5, color: '#b4232a', background: '#fbeaea', border: '1px solid #e0c3c3', borderRadius: 8, padding: '8px 10px', marginBottom: 14 }}>
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%',
            border: 'none',
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.7 : 1,
            padding: '10px 0',
            borderRadius: 9,
            fontFamily: "'Sarabun',sans-serif",
            fontSize: 15,
            fontWeight: 700,
            background: '#c79a3a',
            color: '#1a1205',
          }}
        >
          {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
