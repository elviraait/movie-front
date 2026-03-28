// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGetProfile, apiLogout } from '@/lib/api';
import { clearAccessToken } from '@/lib/auth';
import type { User } from '@/types';

// Русские жанры для отзывов
const GENRE_LABELS: Record<string, string> = {
  ACTION: 'Боевик',
  COMEDY: 'Комедия',
  DRAMA: 'Драма',
  HORROR: 'Ужасы',
  SCI_FI: 'Фантастика',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetProfile()
      .then(setUser)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      // игнорируем
    }
    clearAccessToken();
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-20 w-20 bg-gray-800 rounded-full mb-4" />
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-800 rounded w-1/4" />
      </div>
    );
  }

  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() ?? '?';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Карточка профиля */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Аватар */}
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                {isAdmin && (
                  <span className="bg-yellow-900 text-yellow-300 text-xs px-2 py-0.5 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-gray-600 text-xs mt-1">
                Зарегистрирован{' '}
                {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* История отзывов */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          Мои отзывы{' '}
          <span className="text-gray-500 font-normal text-base">
            ({user.reviews?.length ?? 0})
          </span>
        </h2>

        {!user.reviews || user.reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-gray-500">Вы ещё не оставляли отзывов</p>
            <Link
              href="/"
              className="text-blue-400 hover:underline text-sm mt-2 inline-block"
            >
              Посмотреть фильмы
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {user.reviews.map(review => (
              <Link
                key={review.id}
                href={`/movies/${review.movie.id}`}
                className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="text-white font-medium">{review.movie.title}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-white text-sm font-semibold">
                      {review.rating}/10
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {review.comment}
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-2">
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