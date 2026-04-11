// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiLogin } from '@/lib/api';
import { saveAccessToken } from '@/lib/auth';

const inputStyle = {
  backgroundColor: 'var(--bg-input)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
};

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { accessToken } = await apiLogin(email, password);
      saveAccessToken(accessToken);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Вход в аккаунт
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm block mb-1" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg px-4 py-3 border text-sm outline-none focus:border-blue-500 transition-colors"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-sm block mb-1" style={{ color: 'var(--text-secondary)' }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg px-4 py-3 border text-sm outline-none focus:border-blue-500 transition-colors"
                style={inputStyle}
              />
            </div>

            {error && (
              <p
                className="text-sm rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: 'rgba(127,29,29,0.2)',
                  borderColor: 'rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                text-white py-3 rounded-lg font-semibold transition-colors mt-2 text-sm"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: 'var(--text-muted)' }}>
            Нет аккаунта?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
