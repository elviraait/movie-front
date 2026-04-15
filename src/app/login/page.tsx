'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiLogin, apiGetProfile } from '@/lib/api';
import { saveUserInfo } from '@/lib/auth';
import { notifyAuthChanged } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiLogin(form.email, form.password);
      const profile = await apiGetProfile();
      saveUserInfo({ id: profile.id, name: profile.name, email: profile.email, role: profile.role });
      // Tell Navbar to update immediately
      notifyAuthChanged();
      router.push(profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="fade-up card" style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 32, letterSpacing: 2, marginBottom: 4 }}>
          Sign <span style={{ color: 'var(--accent)' }}>In</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>
          Welcome back to CineVault
        </p>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13,
            }}>{error}</div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', marginTop: 4, padding: '12px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
