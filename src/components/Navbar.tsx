// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, clearAccessToken } from '@/lib/auth';
import { apiLogout } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  // Проверяем токен при каждой смене страницы
  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, [pathname]);

  async function handleLogout() {
    try {
      await apiLogout(); // говорим серверу удалить httpOnly cookie
    } catch {
      // даже если ошибка — всё равно выходим локально
    }
    clearAccessToken();
    setLoggedIn(false);
    router.push('/login');
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Логотип */}
        <Link
          href="/"
          className="text-xl font-bold text-white flex items-center gap-2"
        >
          <span className="text-blue-500">▶</span>
          MovieApp
        </Link>

        {/* Правая часть */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <Link
                href="/profile"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Профиль
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
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