// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, clearAccessToken } from '@/lib/auth';
import { apiLogout, apiGetProfile } from '@/lib/api';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setLoggedIn(auth);
    if (auth) {
      // Читаем роль с API — надёжнее чем парсить JWT вручную
      apiGetProfile()
        .then(user => setIsAdmin(user.role?.toUpperCase() === 'ADMIN'))
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [pathname]);

  async function handleLogout() {
    try { await apiLogout(); } catch {}
    clearAccessToken();
    setLoggedIn(false);
    setIsAdmin(false);
    router.push('/login');
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-blue-500">▶</span>
          MovieApp
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors duration-150"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}
            aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {loggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/movies/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span>+</span> Добавить фильм
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm px-3 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Профиль
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-3 py-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
