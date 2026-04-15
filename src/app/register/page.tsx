'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRegister, apiGetProfile } from '@/lib/api';
import { saveUserInfo } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await apiRegister(form.email, form.password, form.name);
      const profile = await apiGetProfile();
      saveUserInfo({ id: profile.id, name: profile.name, email: profile.email, role: profile.role });
      router.push('/');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="fade-up card" style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 32, letterSpacing: 2, marginBottom: 4 }}>
          Create <span style={{ color: 'var(--accent)' }}>Account</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>Join CineVault today</p>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name', label: 'Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} required placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>{error}</div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '12px' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Have an account? <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
