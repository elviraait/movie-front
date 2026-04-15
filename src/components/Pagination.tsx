'use client';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btn = (content: React.ReactNode, target: number, active = false, disabled = false) => (
    <button
      key={typeof content === 'number' ? content : Math.random()}
      onClick={() => !disabled && onChange(target)}
      disabled={disabled}
      style={{
        minWidth: 36, height: 36, borderRadius: 8,
        background: active ? 'var(--accent)' : 'var(--bg-card)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        color: active ? '#fff' : disabled ? 'var(--text-dim)' : 'var(--text)',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 14, fontWeight: active ? 600 : 400,
        transition: 'all 0.15s', padding: '0 8px',
      }}
    >{content}</button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '32px 0 16px' }}>
      {btn('‹', page - 1, false, page === 1)}
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`dots-${i}`} style={{ color: 'var(--text-dim)', padding: '0 4px' }}>…</span>
          : btn(p, p as number, p === page)
      )}
      {btn('›', page + 1, false, page === totalPages)}
    </div>
  );
}
