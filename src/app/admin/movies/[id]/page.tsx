'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGetMovie, apiUpdateMovie, apiDeleteMovie } from '@/lib/api';
import { PosterUpload } from '@/components/admin/PosterUpload';
import type { Movie, Genre } from '@/types';

const GENRES: Genre[] = ['ACTION','COMEDY','DRAMA','HORROR','SCI_FI'];
const CURRENT_YEAR = new Date().getFullYear();

export default function EditMoviePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState({ title: '', description: '', year: 2000, genre: 'DRAMA' as Genre, posterUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    apiGetMovie(id).then(m => {
      setMovie(m);
      setForm({ title: m.title, description: m.description || '', year: m.year, genre: m.genre, posterUrl: m.posterUrl || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const updated = await apiUpdateMovie(id, {
        title: form.title,
        description: form.description || undefined,
        year: form.year,
        genre: form.genre,
        posterUrl: form.posterUrl || undefined,
      });
      setMovie(updated);
      setSuccess('Movie updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await apiDeleteMovie(id); router.push('/admin/movies'); }
    catch (err: any) { setError(err.message); setDeleting(false); setConfirmDelete(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner" /></div>;
  if (!movie) return <div><p style={{ color: 'var(--text-muted)' }}>Movie not found.</p><Link href="/admin/movies" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>← Back</Link></div>;

  return (
    <div className="fade-up" style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/movies" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>← Movies</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 28, letterSpacing: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{movie.title}</h1>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>🗑 Delete Movie</button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 18, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: -4 }}>Details</h3>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description</label>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Year *</label>
              <input type="number" required min={1888} max={CURRENT_YEAR + 5} value={form.year} onChange={e => set('year', +e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Genre *</label>
              <select value={form.genre} onChange={e => set('genre', e.target.value)}>
                {GENRES.map(g => <option key={g} value={g}>{g.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <PosterUpload value={form.posterUrl} onChange={url => set('posterUrl', url)} genre={form.genre} />
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', color: '#ef4444', fontSize: 13 }}>{error}</div>}
        {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '12px 16px', color: '#22c55e', fontSize: 13 }}>✓ {success}</div>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, padding: 14 }}>
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
          <Link href={`/movies/${id}`} className="btn btn-ghost" style={{ padding: 14, textAlign: 'center' }} target="_blank">👁 View</Link>
        </div>
      </form>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <h3 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 24, marginBottom: 12, color: '#ef4444' }}>Delete Movie?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
              This will permanently delete <strong style={{ color: 'var(--text)' }}>{movie.title}</strong> and all its reviews.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1, background: 'rgba(239,68,68,0.15)' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
