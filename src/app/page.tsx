// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiGetMovies } from '@/lib/api';
import type { Movie, MoviesResponse, MoviesQuery } from '@/types';
import MovieCard from '@/components/MovieCard';
import MovieFilters from '@/components/MovieFilters';

export default function HomePage() {
  const [response,     setResponse]     = useState<MoviesResponse | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [currentQuery, setCurrentQuery] = useState<MoviesQuery>({ page: 1 });

  useEffect(() => {
    loadMovies(currentQuery);
  }, [currentQuery]);

  async function loadMovies(query: MoviesQuery) {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetMovies(query);
      setResponse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить фильмы');
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(query: MoviesQuery) {
    setCurrentQuery(query);
  }

  function handlePageChange(page: number) {
    setCurrentQuery(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Все фильмы
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {response ? `Найдено ${response.meta.total} фильмов` : ''}
        </p>
      </div>

      <MovieFilters onFilter={handleFilter} loading={loading} />

      {/* Ошибка */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => loadMovies(currentQuery)}
            className="mt-3 text-blue-400 hover:underline text-sm"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Скелетон загрузки */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl h-56 animate-pulse"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          ))}
        </div>
      )}

      {!loading && !error && response && (
        <>
          {response.data.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎬</p>
              <p style={{ color: 'var(--text-secondary)' }}>Фильмов не найдено</p>
              <button
                onClick={() => handleFilter({ page: 1 })}
                className="mt-3 text-blue-400 hover:underline text-sm"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {response.data.map((movie: Movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Пагинация */}
              {response.meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => handlePageChange(response.meta.page - 1)}
                    disabled={!response.meta.hasPrevPage}
                    className="px-4 py-2 rounded-lg disabled:opacity-40 transition-colors text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  >
                    ← Назад
                  </button>
                  <span className="text-sm px-3" style={{ color: 'var(--text-secondary)' }}>
                    {response.meta.page} из {response.meta.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(response.meta.page + 1)}
                    disabled={!response.meta.hasNextPage}
                    className="px-4 py-2 rounded-lg disabled:opacity-40 transition-colors text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  >
                    Вперёд →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
