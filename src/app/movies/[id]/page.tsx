// src/app/movies/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetMovieWithReviews, apiDeleteReview } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Movie, Review } from "@/types";
import ReviewForm from "@/components/ReviewForm";

// Русские жанры
const GENRE_LABELS: Record<string, string> = {
  ACTION: "Боевик",
  COMEDY: "Комедия",
  DRAMA: "Драма",
  HORROR: "Ужасы",
  SCI_FI: "Фантастика",
};

type MovieWithReviews = Movie & { reviews: Review[] };

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<MovieWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  // useCallback чтобы передавать функцию в ReviewForm без лишних перерендеров
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiGetMovieWithReviews(id);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Фильм не найден");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("Удалить отзыв?")) return;
    setDeletingId(reviewId);
    try {
      await apiDeleteReview(reviewId);
      await loadData(); // обновляем список после удаления
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Не удалось удалить");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-800 rounded w-1/4 mb-8" />
        <div className="h-32 bg-gray-800 rounded mb-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-red-400 mb-4">{error || "Фильм не найден"}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-400 hover:underline"
        >
          ← Назад
        </button>
      </div>
    );
  }

  // Средний рейтинг из отзывов
  const avgRating =
    data.reviews.length > 0
      ? (
          data.reviews.reduce((sum, r) => sum + r.rating, 0) /
          data.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Кнопка назад */}
      <button
        onClick={() => router.back()}
        className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← К списку фильмов
      </button>

      {/* Инфо о фильме */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{data.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-gray-400">{data.year}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">
                {GENRE_LABELS[data.genre] || data.genre}
              </span>
              {avgRating && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white font-semibold">
                      {avgRating}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({data.reviews.length}{" "}
                      {data.reviews.length === 1 ? "отзыв" : "отзывов"})
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {data.description && (
          <p className="text-gray-300 mt-5 leading-relaxed">
            {data.description}
          </p>
        )}
      </div>

      {/* Форма отзыва — только для авторизованных */}
      {loggedIn ? (
        <div className="mb-8">
          <ReviewForm movieId={id} onReviewAdded={loadData} />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 text-center">
          <p className="text-gray-400 text-sm">
            Чтобы оставить отзыв,{" "}
            <a href="/login" className="text-blue-400 hover:underline">
              войдите в аккаунт
            </a>
          </p>
        </div>
      )}

      {/* Список отзывов */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Отзывы{data.reviews.length > 0 && ` (${data.reviews.length})`}
        </h2>

        {data.reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Отзывов пока нет. Будь первым!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.reviews.map((review: Review) => (
              <div
                key={review.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-blue-400 font-medium text-sm">
                      {review.user?.name ?? "Аноним"}
                    </span>
                    <span className="text-gray-600 text-xs ml-3">
                      {new Date(review.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-white text-sm font-semibold">
                        {review.rating}/10
                      </span>
                    </div>
                    {/* Кнопка удаления — появится если это твой отзыв */}
                    {loggedIn && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingId === review.id}
                        className="text-gray-600 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
                      >
                        {deletingId === review.id ? "..." : "Удалить"}
                      </button>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-300 mt-2 text-sm leading-relaxed">
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
