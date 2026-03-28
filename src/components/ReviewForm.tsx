// src/components/ReviewForm.tsx
"use client";

import { useState } from "react";
import { apiCreateReview } from "@/lib/api";

interface Props {
  movieId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ movieId, onReviewAdded }: Props) {
  const [rating, setRating] = useState(7);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiCreateReview({
        movieId,
        rating,
        comment: comment.trim() || undefined, // если пустой — не отправляем
      });
      setComment("");
      setRating(7);
      onReviewAdded(); // сообщаем родителю: обнови отзывы!
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка при отправке");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Написать отзыв</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Звёзды рейтинга */}
        <div>
          <label className="text-gray-400 text-sm block mb-2">
            Оценка:{" "}
            <span className="text-white font-semibold">{rating}/10</span>
          </label>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  n <= rating
                    ? "bg-yellow-500 text-gray-900"
                    : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Комментарий (необязательный) */}
        <div>
          <label className="text-gray-400 text-sm block mb-1">
            Комментарий <span className="text-gray-600">(необязательно)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Поделитесь впечатлениями..."
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? "Отправка..." : "Опубликовать отзыв"}
        </button>
      </form>
    </div>
  );
}
