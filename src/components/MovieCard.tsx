// src/components/MovieCard.tsx
'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import type { Movie } from '@/types';

const GENRE_LABELS: Record<string, string> = {
  ACTION: 'Боевик',
  COMEDY: 'Комедия',
  DRAMA: 'Драма',
  HORROR: 'Ужасы',
  SCI_FI: 'Фантастика',
};

// Градиент для постера по жанру (тёмная тема)
const GENRE_GRADIENTS_DARK: Record<string, string> = {
  ACTION:  'linear-gradient(145deg, #7f1d1d 0%, #dc2626 50%, #f97316 100%)',
  COMEDY:  'linear-gradient(145deg, #78350f 0%, #d97706 50%, #fbbf24 100%)',
  DRAMA:   'linear-gradient(145deg, #3b0764 0%, #7c3aed 50%, #a78bfa 100%)',
  HORROR:  'linear-gradient(145deg, #1f2937 0%, #374151 50%, #6b7280 100%)',
  SCI_FI:  'linear-gradient(145deg, #0c1445 0%, #1d4ed8 50%, #06b6d4 100%)',
};

// Градиент для постера по жанру (светлая тема)
const GENRE_GRADIENTS_LIGHT: Record<string, string> = {
  ACTION:  'linear-gradient(145deg, #fca5a5 0%, #f87171 50%, #fb923c 100%)',
  COMEDY:  'linear-gradient(145deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)',
  DRAMA:   'linear-gradient(145deg, #ddd6fe 0%, #a78bfa 50%, #8b5cf6 100%)',
  HORROR:  'linear-gradient(145deg, #d1d5db 0%, #9ca3af 50%, #6b7280 100%)',
  SCI_FI:  'linear-gradient(145deg, #bfdbfe 0%, #60a5fa 50%, #22d3ee 100%)',
};

// Эмодзи-иконка жанра на постере
const GENRE_ICONS: Record<string, string> = {
  ACTION: '💥',
  COMEDY: '😄',
  DRAMA:  '🎭',
  HORROR: '👻',
  SCI_FI: '🚀',
};

// Цвет бейджа (тёмная тема)
const GENRE_BADGE_DARK: Record<string, { bg: string; text: string }> = {
  ACTION: { bg: '#7f1d1d', text: '#fca5a5' },
  COMEDY: { bg: '#78350f', text: '#fcd34d' },
  DRAMA:  { bg: '#3b0764', text: '#c4b5fd' },
  HORROR: { bg: '#1f2937', text: '#9ca3af' },
  SCI_FI: { bg: '#1e3a8a', text: '#93c5fd' },
};

// Цвет бейджа (светлая тема)
const GENRE_BADGE_LIGHT: Record<string, { bg: string; text: string }> = {
  ACTION: { bg: '#fee2e2', text: '#991b1b' },
  COMEDY: { bg: '#fef3c7', text: '#92400e' },
  DRAMA:  { bg: '#ede9fe', text: '#5b21b6' },
  HORROR: { bg: '#f3f4f6', text: '#374151' },
  SCI_FI: { bg: '#dbeafe', text: '#1e40af' },
};

function getReviewWord(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return 'отзывов';
  if (last === 1) return 'отзыв';
  if (last >= 2 && last <= 4) return 'отзыва';
  return 'отзывов';
}

export default function MovieCard({ movie }: { movie: Movie }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gradients = isDark ? GENRE_GRADIENTS_DARK : GENRE_GRADIENTS_LIGHT;
  const badges = isDark ? GENRE_BADGE_DARK : GENRE_BADGE_LIGHT;

  const gradient = gradients[movie.genre] ?? gradients.DRAMA;
  const icon = GENRE_ICONS[movie.genre] ?? '🎬';
  const badge = badges[movie.genre] ?? badges.DRAMA;

  return (
    <Link href={`/movies/${movie.id}`} className="block group">
      <div
        className="rounded-xl overflow-hidden border transition-all duration-200
          hover:-translate-y-1 hover:shadow-xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Постер — градиент по жанру */}
        <div
          className="relative h-36 flex items-center justify-center overflow-hidden"
          style={{ background: gradient }}
        >
          {/* Большой эмодзи по центру */}
          <span className="text-5xl opacity-60 select-none">{icon}</span>

          {/* Год в правом верхнем углу */}
          <span className="absolute top-2.5 right-3 text-white/70 text-xs font-medium">
            {movie.year}
          </span>

          {/* Счётчик отзывов в левом нижнем углу */}
          {movie._count !== undefined && (
            <span className="absolute bottom-2.5 left-3 text-white/60 text-xs">
              {movie._count.reviews} {getReviewWord(movie._count.reviews)}
            </span>
          )}
        </div>

        {/* Текстовая часть */}
        <div className="p-4">
          {/* Название */}
          <h3
            className="font-semibold text-sm leading-snug mb-2.5 line-clamp-2
              group-hover:text-blue-500 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {movie.title}
          </h3>

          {/* Жанр — бейдж */}
          <span
            className="inline-block text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {GENRE_LABELS[movie.genre] ?? movie.genre}
          </span>

          {/* Описание */}
          {movie.description && (
            <p
              className="text-xs leading-relaxed line-clamp-2 mt-2.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {movie.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
