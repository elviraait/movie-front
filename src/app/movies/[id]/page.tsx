// src/app/movies/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGetMovieWithReviews, apiDeleteReview, apiDeleteMovie, apiGetProfile } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import type { Movie, Review } from '@/types';
import ReviewForm from '@/components/ReviewForm';

const GENRE_LABELS: Record<string, string> = {
  ACTION: 'Боевик',
  COMEDY: 'Комедия',
  DRAMA:  'Драма',
  HORROR: 'Ужасы',
  SCI_FI: 'Фантастика',
};

const GENRE_GRADIENTS: Record<string, string> = {
  ACTION:  'linear-gradient(135deg, #7f1d1d, #dc2626, #f97316)',
  COMEDY:  'linear-gradient(135deg, #78350f, #d97706, #fbbf24)',
  DRAMA:   'linear-gradient(135deg, #3b0764, #7c3aed, #a78bfa)',
  HORROR:  'linear-gradient(135deg, #030712, #111827, #1f2937)',
  SCI_FI:  'linear-gradient(135deg, #0c1445, #1d4ed8, #06b6d4)',
};

const GENRE_ICONS: Record<string, string> = {
  ACTION: '💥', COMEDY: '😄', DRAMA: '🎭', HORROR: '👻', SCI_FI: '🚀',
};

type MovieWithReviews = Movie & { reviews: Review[] };

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [data,       setData]       = useState<MovieWithReviews | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [loggedIn,   setLoggedIn]   = useState(false);
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setLoggedIn(auth);
    if (auth) {
      apiGetProfile().then(u => setIsAdmin(u.role === 'ADMIN')).catch(() => {});
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiGetMovieWithReviews(id);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Фильм не найден');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Удалить отзыв?')) return;
    setDeletingId(reviewId);
    try {
      await apiDeleteReview(reviewId);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteMovie() {
    if (!data) return;
    if (!confirm(`Удалить фильм «${data.title}»? Это действие нельзя отменить.`)) return;
    setDeleting(true);
    try {
      await apiDeleteMovie(id);
      router.push('/');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить фильм');
      setDeleting(false);
    }
  }

  // ─── Скелетон загрузки ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-48 rounded-2xl mb-6" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="h-8 rounded w-1/2 mb-3" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="h-4 rounded w-1/4 mb-8" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="h-32 rounded-xl" style={{ backgroundColor: 'var(--bg-input)' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-red-400 mb-4">{error || 'Фильм не найден'}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-400 hover:underline"
        >
          ← Назад
        </button>
      </div>
    );
  }

  const avgRating =
    data.reviews.length > 0
      ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1)
      : null;

  const gradient = GENRE_GRADIENTS[data.genre] ?? GENRE_GRADIENTS.DRAMA;
  const icon     = GENRE_ICONS[data.genre] ?? '🎬';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Кнопка назад */}
      <button
        onClick={() => router.back()}
        className="text-sm mb-6 flex items-center gap-1 transition-colors hover:text-blue-400"
        style={{ color: 'var(--text-muted)' }}
      >
        ← К списку фильмов
      </button>

      {/* Постер-шапка */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 h-48 flex items-end"
        style={{ background: gradient }}
      >
        {/* Большой эмодзи */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          text-7xl opacity-30 select-none">
          {icon}
        </span>

        {/* Инфо поверх градиента */}
        <div className="relative z-10 p-6 w-full"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
          <h1 className="text-3xl font-bold text-white">{data.title}</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-sm">
            <span className="text-white/70">{data.year}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/70">{GENRE_LABELS[data.genre] ?? data.genre}</span>
            {avgRating && (
              <>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white font-semibold">{avgRating}</span>
                  <span className="text-white/50 text-xs">({data.reviews.length})</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Описание + кнопка удаления для админа */}
      {(data.description || isAdmin) && (
        <div
          className="rounded-2xl border p-6 mb-8 flex justify-between items-start gap-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {data.description && (
            <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>
              {data.description}
            </p>
          )}
          {isAdmin && (
            <button
              onClick={handleDeleteMovie}
              disabled={deleting}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border
                text-red-400 border-red-900/50 hover:bg-red-900/20
                disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Удаление...' : 'Удалить фильм'}
            </button>
          )}
        </div>
      )}

      {/* Форма отзыва */}
      {loggedIn ? (
        <div className="mb-8">
          <ReviewForm movieId={id} onReviewAdded={loadData} />
        </div>
      ) : (
        <div
          className="rounded-xl border p-4 mb-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Чтобы оставить отзыв,{' '}
            <a href="/login" className="text-blue-400 hover:underline">
              войдите в аккаунт
            </a>
          </p>
        </div>
      )}

      {/* Список отзывов */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Отзывы{data.reviews.length > 0 && ` (${data.reviews.length})`}
        </h2>

        {data.reviews.length === 0 ? (
          <div
            className="text-center py-10 rounded-xl border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Отзывов пока нет. Будь первым!
          </div>
        ) : (
          <div className="space-y-3">
            {data.reviews.map((review: Review) => (
              <div
                key={review.id}
                className="rounded-xl border p-4"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-blue-400 font-medium text-sm">
                      {review.user?.name ?? 'Аноним'}
                    </span>
                    <span className="text-xs ml-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {review.rating}/10
                      </span>
                    </div>
                    {loggedIn && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingId === review.id}
                        className="text-xs transition-colors disabled:opacity-50
                          hover:text-red-400"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {deletingId === review.id ? '...' : 'Удалить'}
                      </button>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
