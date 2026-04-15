'use client';
import { useRef, useState } from 'react';
import { apiUploadPoster } from '@/lib/api';

const GENRE_ICONS: Record<string, string> = {
  ACTION: '💥', COMEDY: '😂', DRAMA: '🎭', HORROR: '👻', SCI_FI: '🚀',
};

interface Props {
  value: string;
  onChange: (url: string) => void;
  genre?: string;
}

export function PosterUpload({ value, onChange, genre = '' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState(value || '');

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    // Optimistic local preview
    const localUrl = URL.createObjectURL(file);
    onChange(localUrl);
    try {
      const { url } = await apiUploadPoster(file);
      onChange(url);
      setUrlInput(url);
    } catch (e: any) {
      onChange(value); // revert
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasImage = value && !value.startsWith('blob:') ? value : (value?.startsWith('blob:') ? value : '');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
          Movie Poster <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span>
        </label>
        {value && (
          <button type="button" onClick={handleClear}
            style={{ fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Remove
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Preview */}
        <div style={{
          aspectRatio: '2/3', borderRadius: 10, overflow: 'hidden',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          position: 'relative', flexShrink: 0,
        }}>
          {value ? (
            <img
              src={value} alt="Poster preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => onChange('')}
            />
          ) : (
            // No-poster placeholder matching MovieCard style
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'linear-gradient(135deg, #141414, #1a1a1a)',
            }}>
              <span style={{ fontSize: 28 }}>{GENRE_ICONS[genre] || '🎬'}</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', padding: '0 6px' }}>
                No poster
              </span>
            </div>
          )}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
              <span style={{ fontSize: 11, color: '#fff' }}>Uploading…</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: '2px dashed var(--border)', borderRadius: 10,
              padding: '20px 12px', textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
              background: 'var(--bg-elevated)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = 'var(--accent)';
              el.style.background = 'var(--accent-dim)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = 'var(--border)';
              el.style.background = 'var(--bg-elevated)';
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>📷</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.4 }}>
              Drop image or <span style={{ color: 'var(--accent)' }}>click to browse</span>
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 4 }}>
              JPG · PNG · WEBP · max 10 MB
            </p>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {/* Or URL */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: 11, color: 'var(--text-dim)', padding: '0 12px',
              pointerEvents: 'none',
            }}>🔗</span>
            <input
              placeholder="Or paste image URL (TMDB, IMDB…)"
              value={urlInput}
              onChange={e => handleUrlChange(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '8px 12px', color: '#ef4444', fontSize: 12,
            }}>
              ⚠ {error}
            </div>
          )}

          <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Images are stored on <strong style={{ color: 'var(--text-muted)' }}>Cloudinary</strong>.<br />
            If Cloudinary is not set up, use a URL instead.
          </p>
        </div>
      </div>
    </div>
  );
}
