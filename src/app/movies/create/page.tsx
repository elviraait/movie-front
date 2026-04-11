// src/app/movies/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiCreateMovie, apiGetProfile } from '@/lib/api';
import type { Genre } from '@/types';

const GENRES: { value: Genre; label: string; icon: string }[] = [
  { value: 'ACTION',  label: 'Боевик',     icon: '💥' },
  { value: 'COMEDY',  label: 'Комедия',    icon: '😄' },
  { value: 'DRAMA',   label: 'Драма',      icon: '🎭' },
  { value: 'HORROR',  label: 'Ужасы',      icon: '👻' },
  { value: 'SCI_FI',  label: 'Фантастика', icon: '🚀' },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function CreateMoviePage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [genre, setGenre] = useState<Genre>('ACTION');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Защита маршрута — только ADMIN
  useEffect(() => {
    apiGetProfile()
      .then((user) => {
        if (user.role !== 'ADMIN') router.replace('/');
        else setChecking(false);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const yearNum = parseInt(year, 10);
    if (!title.trim()) return setError('Введите название фильма');
    if (isNaN(yearNum) || yearNum < 1888 || yearNum > CURRENT_YEAR + 5)
      return setError(`Год должен быть от 1888 до ${CURRENT_YEAR + 5}`);

    setLoading(true);
    try {
      const movie = await apiCreateMovie({
        title: title.trim(),
        description: description.trim() || undefined,
        year: yearNum,
        genre,
      });
      router.push(`/movies/${movie.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 rounded-lg w-1/2 mb-8" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-12 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
          Главная
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Добавить фильм</span>
      </div>

      <div
        className="rounded-2xl border p-8"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Добавить фильм
        </h1>

        <div className="space-y-5">
          {/* Название */}
          <div>
            <label className="text-sm block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Интерстеллар"
              maxLength={200}
              className="w-full rounded-lg px-4 py-3 border text-sm outline-none
                transition-colors focus:border-blue-500"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Описание */}
          <div>
            <label className="text-sm block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Описание{' '}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                (необязательно)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание сюжета..."
              rows={3}
              maxLength={1000}
              className="w-full rounded-lg px-4 py-3 border text-sm outline-none
                transition-colors focus:border-blue-500 resize-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
              {description.length}/1000
            </p>
          </div>

          {/* Год + Жанр в одну строку */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Год <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1888}
                max={CURRENT_YEAR + 5}
                className="w-full rounded-lg px-4 py-3 border text-sm outline-none
                  transition-colors focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="text-sm block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Жанр <span className="text-red-500">*</span>
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
                className="w-full rounded-lg px-4 py-3 border text-sm outline-none
                  transition-colors focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.icon} {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm border"
              style={{
                backgroundColor: 'rgba(127, 29, 29, 0.2)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg
                transition-colors text-sm"
            >
              {loading ? 'Создание...' : 'Создать фильм'}
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-lg transition-colors text-sm text-center"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)',
              }}
            >
              Отмена
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
