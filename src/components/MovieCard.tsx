// src/components/MovieCard.tsx
import Link from "next/link";
import type { Movie } from "@/types";

// Русские названия жанров
const GENRE_LABELS: Record<string, string> = {
  ACTION: "Боевик",
  COMEDY: "Комедия",
  DRAMA: "Драма",
  HORROR: "Ужасы",
  SCI_FI: "Фантастика",
};

// Цвет бейджа для каждого жанра
const GENRE_COLORS: Record<string, string> = {
  ACTION: "bg-red-900 text-red-300",
  COMEDY: "bg-yellow-900 text-yellow-300",
  DRAMA: "bg-purple-900 text-purple-300",
  HORROR: "bg-gray-800 text-gray-300",
  SCI_FI: "bg-blue-900 text-blue-300",
};

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movies/${movie.id}`} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-full hover:border-gray-600 transition-all duration-200 hover:-translate-y-1">
        {/* Заголовок + год */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="text-white font-semibold text-base leading-tight group-hover:text-blue-400 transition-colors">
            {movie.title}
          </h3>
          <span className="text-gray-500 text-sm whitespace-nowrap">
            {movie.year}
          </span>
        </div>

        {/* Жанр */}
        <span
          className={`inline-block text-xs px-2 py-1 rounded-md font-medium mb-3 ${
            GENRE_COLORS[movie.genre] || "bg-gray-800 text-gray-300"
          }`}
        >
          {GENRE_LABELS[movie.genre] || movie.genre}
        </span>

        {/* Описание */}
        {movie.description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
            {movie.description}
          </p>
        )}

        {/* Счётчик отзывов */}
        {movie._count && (
          <p className="text-gray-600 text-xs mt-3">
            {movie._count.reviews} {getReviewWord(movie._count.reviews)}
          </p>
        )}
      </div>
    </Link>
  );
}

// Правильное склонение слова "отзыв"
function getReviewWord(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return "отзывов";
  if (last === 1) return "отзыв";
  if (last >= 2 && last <= 4) return "отзыва";
  return "отзывов";
}
