'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiGetMovies, apiDeleteMovie } from '@/lib/api';
import { Pagination } from '@/components/Pagination';
import type { Movie, Genre, MoviesQuery } from '@/types';

const GENRE_COLORS: Record<string, string> = {
  ACTION: 'badge-action', COMEDY: 'badge-comedy', DRAMA: 'badge-drama',
  HORROR: 'badge-horror', SCI_FI: 'badge-sci_fi',
};
const GENRES: Genre[] = ['ACTION','COMEDY','DRAMA','HORROR','SCI_FI'];

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<MoviesQuery>({ page: 1, limit: 15, sortBy: 'createdAt', order: 'desc' });
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Movie | null>(null);

  const load = useCallback(async (q: MoviesQuery) => {
    setLoading(true);
    try {
      const res = await apiGetMovies(q);
      setMovies(res.data);
      setMeta({ total: res.meta.total, page: res.meta.page, totalPages: res.meta.totalPages });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(query); }, [query, load]);

  const doDelete = async (movie: Movie) => {
    setDeleting(movie.id);
    try {
      await apiDeleteMovie(movie.id);
      setMovies(ms => ms.filter(m => m.id !== movie.id));
      setMeta(m => ({ ...m, total: m.total - 1 }));
    } finally { setDeleting(null); setConfirm(null); }
  };

  const applySearch = () => setQuery(q => ({ ...q, title: search || undefined, page: 1 }));

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 36, letterSpacing: 2 }}>Movies</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{meta.total} total</p>
        </div>
        <Link href="/admin/movies/create" className="btn btn-primary">+ Add Movie</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flex: '1 1 200px' }}>
            <input placeholder="Search title…" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()} />
            <button className="btn btn-primary btn-sm" onClick={applySearch}>Go</button>
          </div>
          <select value={query.genre || ''} onChange={e => setQuery(q => ({ ...q, genre: (e.target.value as Genre) || undefined, page: 1 }))} style={{ width: 140 }}>
            <option value="">All genres</option>
            {GENRES.map(g => <option key={g} value={g}>{g.replace('_',' ')}</option>)}
          </select>
          <select value={`${query.sortBy}:${query.order}`}
            onChange={e => {
              const [sortBy, order] = e.target.value.split(':') as [MoviesQuery['sortBy'], MoviesQuery['order']];
              setQuery(q => ({ ...q, sortBy, order, page: 1 }));
            }} style={{ width: 160 }}>
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="year:desc">Year ↓</option>
            <option value="year:asc">Year ↑</option>
            <option value="title:asc">Title A–Z</option>
          </select>
          {(query.title || query.genre) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setQuery({ page: 1, limit: 15, sortBy: 'createdAt', order: 'desc' }); }}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : movies.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎬</div>
            <p>No movies found</p>
            <Link href="/admin/movies/create" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Add First Movie</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  {['Poster','Title','Genre','Year','Reviews','Added','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movies.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i < movies.length-1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ width: 40, height: 56, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                        {m.posterUrl
                          ? <img src={m.posterUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
                        }
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 500, maxWidth: 220 }}>
                      <Link href={`/movies/${m.id}`} style={{ textDecoration: 'none', color: 'var(--text)' }} target="_blank">{m.title}</Link>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`badge ${GENRE_COLORS[m.genre]}`} style={{ fontSize: 11 }}>{m.genre.replace('_',' ')}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{m.year}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{m._count?.reviews ?? 0}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/admin/movies/${m.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm"
                          disabled={deleting === m.id}
                          onClick={() => setConfirm(m)}>
                          {deleting === m.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={p => setQuery(q => ({ ...q, page: p }))} />

      {/* Confirm dialog */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <h3 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 24, marginBottom: 12 }}>Delete Movie?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
              "<strong style={{ color: 'var(--text)' }}>{confirm.title}</strong>" and all its reviews will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1, background: 'rgba(239,68,68,0.15)' }}
                onClick={() => doDelete(confirm)} disabled={!!deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
