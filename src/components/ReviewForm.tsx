// src/components/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { apiCreateReview } from '@/lib/api';

interface Props {
  movieId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ movieId, onReviewAdded }: Props) {
  const [rating,  setRating]  = useState(7);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiCreateReview({
        movieId,
        rating,
        comment: comment.trim() || undefined,
      });
      setComment('');
      setRating(7);
      onReviewAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при отправке');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Написать отзыв
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Рейтинг */}
        <div>
          <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>
            Оценка:{' '}
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {rating}/10
            </span>
          </label>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="w-8 h-8 rounded text-sm font-medium transition-colors"
                style={
                  n <= rating
                    ? { backgroundColor: '#eab308', color: '#111827' }
                    : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Комментарий */}
        <div>
          <label className="text-sm block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Комментарий{' '}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              (необязательно)
            </span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Поделитесь впечатлениями..."
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none
              focus:border-blue-500 transition-colors resize-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
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
            text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          {loading ? 'Отправка...' : 'Опубликовать отзыв'}
        </button>
      </form>
    </div>
  );
}
