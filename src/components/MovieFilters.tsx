// src/components/MovieFilters.tsx
'use client';

import { useState } from 'react';
import type { MoviesQuery, Genre } from '@/types';

interface Props {
  onFilter: (query: MoviesQuery) => void;
  loading: boolean;
}

const GENRES: { value: Genre; label: string }[] = [
  { value: 'ACTION', label: 'Боевик' },
  { value: 'COMEDY', label: 'Комедия' },
  { value: 'DRAMA', label: 'Драма' },
  { value: 'HORROR', label: 'Ужасы' },
  { value: 'SCI_FI', label: 'Фантастика' },
];

const fieldStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-input)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
};

export default function MovieFilters({ onFilter, loading }: Props) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<Genre | ''>('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'createdAt'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query: MoviesQuery = { page: 1 };
    if (title.trim()) query.title = title.trim();
    if (genre) query.genre = genre;
    if (year && !isNaN(Number(year))) query.year = Number(year);
    query.sortBy = sortBy;
    query.order = order;
    onFilter(query);
  }

  function handleReset() {
    setTitle('');
    setGenre('');
    setYear('');
    setSortBy('createdAt');
    setOrder('desc');
    onFilter({ page: 1 });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-4 mb-8 border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Поиск по названию..."
          className="rounded-lg px-3 py-2 text-sm border focus:outline-none focus:border-blue-500 transition-colors"
          style={fieldStyle}
        />

        <select
          value={genre}
          onChange={e => setGenre(e.target.value as Genre | '')}
          className="rounded-lg px-3 py-2 text-sm border focus:outline-none focus:border-blue-500 transition-colors"
          style={fieldStyle}
        >
          <option value="">Все жанры</option>
          {GENRES.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          placeholder="Год (напр. 2023)"
          min={1888}
          max={new Date().getFullYear()}
          className="rounded-lg px-3 py-2 text-sm border focus:outline-none focus:border-blue-500 transition-colors"
          style={fieldStyle}
        />

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'title' | 'year' | 'createdAt')}
            className="flex-1 rounded-lg px-3 py-2 text-sm border focus:outline-none focus:border-blue-500 transition-colors"
            style={fieldStyle}
          >
            <option value="createdAt">По дате</option>
            <option value="year">По году</option>
            <option value="title">По названию</option>
          </select>
          <select
            value={order}
            onChange={e => setOrder(e.target.value as 'asc' | 'desc')}
            className="rounded-lg px-2 py-2 text-sm border focus:outline-none focus:border-blue-500 transition-colors"
            style={fieldStyle}
          >
            <option value="desc">↓</option>
            <option value="asc">↑</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Поиск...' : 'Найти'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm px-5 py-2 rounded-lg border transition-colors"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        >
          Сбросить
        </button>
      </div>
    </form>
  );
}
