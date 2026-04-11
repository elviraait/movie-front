// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGetProfile, apiLogout } from '@/lib/api';
import { clearAccessToken } from '@/lib/auth';
import type { User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetProfile()
      .then(setUser)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try { await apiLogout(); } catch {}
    clearAccessToken();
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-20 w-20 rounded-full mb-4" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="h-6 rounded w-1/3 mb-2" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'var(--bg-input)' }} />
      </div>
    );
  }

  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() ?? '?';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Карточка профиля */}
      <div
        className="rounded-2xl border p-6 mb-6"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Аватар */}
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </h1>
                {isAdmin && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#78350f', color: '#fcd34d' }}>
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Зарегистрирован{' '}
                {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* История отзывов */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Мои отзывы{' '}
          <span className="font-normal text-base" style={{ color: 'var(--text-muted)' }}>
            ({user.reviews?.length ?? 0})
          </span>
        </h2>

        {!user.reviews || user.reviews.length === 0 ? (
          <div
            className="text-center py-10 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <p style={{ color: 'var(--text-muted)' }}>Вы ещё не оставляли отзывов</p>
            <Link href="/" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
              Посмотреть фильмы
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {user.reviews.map(review => (
              <Link
                key={review.id}
                href={`/movies/${review.movie.id}`}
                className="block rounded-xl border p-4 transition-all hover:border-blue-500/40"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {review.movie.title}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {review.rating}/10
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {review.comment}
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
