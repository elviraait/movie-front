'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGetMovieWithReviews, apiCreateReview, apiDeleteReview } from '@/lib/api';
import { getAccessToken, getUserInfo, isAdmin } from '@/lib/auth';
import type { Movie, Review } from '@/types';

const GENRE_ICONS: Record<string, string> = { ACTION: '💥', COMEDY: '😂', DRAMA: '🎭', HORROR: '👻', SCI_FI: '🚀' };
const GENRE_COLORS: Record<string, string> = { ACTION: 'badge-action', COMEDY: 'badge-comedy', DRAMA: 'badge-drama', HORROR: 'badge-horror', SCI_FI: 'badge-sci_fi' };

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(n)}
          style={{
            background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default',
            fontSize: 18, padding: '0 1px',
            color: n <= (hover || value) ? 'var(--gold)' : 'var(--border-hover)',
          }}>★</button>
      ))}
    </div>
  );
}

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<(Movie & { reviews: Review[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 7, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const user = getUserInfo();
  const admin = isAdmin();

  useEffect(() => {
    apiGetMovieWithReviews(id).then(setMovie).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getAccessToken()) { router.push('/login'); return; }
    setSubmitting(true); setError('');
    try {
      const r = await apiCreateReview({ ...reviewForm, movieId: id });
      setMovie(m => m ? { ...m, reviews: [r, ...m.reviews] } : m);
      setReviewForm({ rating: 7, comment: '' });
    } catch (err: any) { setError(err.message); } finally { setSubmitting(false); }
  };

  const deleteReview = async (rid: string) => {
    await apiDeleteReview(rid);
    setMovie(m => m ? { ...m, reviews: m.reviews.filter(r => r.id !== rid) } : m);
  };

  const avgRating = movie?.reviews?.length
    ? (movie.reviews.reduce((s, r) => s + r.rating, 0) / movie.reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  if (!movie) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ color: 'var(--text-muted)' }}>Movie not found</p>
      <Link href="/" className="btn btn-ghost" style={{ marginTop: 16 }}>← Back</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        ← Back to movies
      </Link>

      {/* Hero */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,280px) 1fr', gap: 32, marginBottom: 40 }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '2/3', background: 'var(--bg-elevated)', flexShrink: 0 }}>
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : null}
          {/* Placeholder when no poster */}
          {!movie.posterUrl && (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 80 }}>{GENRE_ICONS[movie.genre] || '🎬'}</span>
              <span style={{
                fontFamily: 'Bebas Neue, cursive', fontSize: 18,
                color: 'rgba(255,255,255,0.25)', letterSpacing: 3, textAlign: 'center',
              }}>{movie.genre.replace('_',' ')}</span>
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className={`badge ${GENRE_COLORS[movie.genre]}`}>{GENRE_ICONS[movie.genre]} {movie.genre.replace('_',' ')}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{movie.year}</span>
          </div>

          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 'clamp(32px,5vw,56px)', letterSpacing: 2, marginBottom: 16, lineHeight: 1.1 }}>
            {movie.title}
          </h1>

          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 36, color: 'var(--gold)' }}>{avgRating}</span>
              <div>
                <div style={{ color: 'var(--gold)', fontSize: 18 }}>{'★'.repeat(Math.round(+avgRating / 2))}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{movie.reviews.length} reviews</div>
              </div>
            </div>
          )}

          {movie.description && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 600, marginBottom: 24 }}>
              {movie.description}
            </p>
          )}

          {admin && (
            <Link href={`/admin/movies/${movie.id}`} className="btn btn-ghost btn-sm">
              ✏ Edit Movie
            </Link>
          )}
        </div>
      </div>

      {/* Review form */}
      {getAccessToken() && (
        <div className="card fade-up" style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 22, letterSpacing: 1, marginBottom: 16 }}>
            Write a Review
          </h3>
          <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                Rating: <strong style={{ color: 'var(--gold)' }}>{reviewForm.rating}/10</strong>
              </label>
              <StarRating value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
            </div>
            <textarea rows={3} placeholder="Share your thoughts..." value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
            {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
              {submitting ? 'Posting…' : 'Post Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {movie.reviews.length > 0 && (
        <div className="fade-up">
          <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28, letterSpacing: 1, marginBottom: 20 }}>
            Reviews <span style={{ color: 'var(--text-dim)', fontSize: 18 }}>({movie.reviews.length})</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {movie.reviews.map(r => (
              <div key={r.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.user.name}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 12, marginLeft: 10 }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: 'var(--accent-dim)', color: 'var(--gold)', borderRadius: 6, padding: '2px 10px', fontSize: 14, fontWeight: 600 }}>
                      ★ {r.rating}/10
                    </span>
                    {(admin || r.userId === user?.id) && (
                      <button onClick={() => deleteReview(r.id)} className="btn btn-danger btn-sm">✕</button>
                    )}
                  </div>
                </div>
                {r.comment && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
