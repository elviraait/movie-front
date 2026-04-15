'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Закрывать дропдаун при любой навигации
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const isAdmin      = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'Bebas Neue, cursive', fontSize: 24, letterSpacing: 2,
          color: 'var(--accent)', lineHeight: 1,
        }}>CINEVAULT</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isAdmin && (
          <Link href="/admin" className="btn btn-ghost btn-sm" style={{
            borderColor: isSuperAdmin ? 'rgba(245,197,24,0.4)' : 'var(--border)',
            color: isSuperAdmin ? '#f5c518' : 'var(--text-muted)',
          }}>
            {isSuperAdmin ? '👑' : '⚙️'} Admin
          </Link>
        )}

        <button onClick={toggle} style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
          color: 'var(--text)', fontSize: 16, lineHeight: 1,
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: isSuperAdmin ? 'rgba(245,197,24,0.15)' : 'var(--accent)',
                border: isSuperAdmin ? '1px solid rgba(245,197,24,0.5)' : 'none',
                borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                color: isSuperAdmin ? '#f5c518' : '#fff',
                fontWeight: 600, fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {isSuperAdmin ? '👑 ' : ''}{user.name.split(' ')[0]} ▾
            </button>

            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 150 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 200,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: 8, minWidth: 190,
                  boxShadow: 'var(--shadow-lg)',
                }}>
                  <div style={{
                    padding: '6px 12px 10px',
                    borderBottom: '1px solid var(--border)', marginBottom: 4,
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Signed in as</p>
                    <p style={{
                      fontSize: 13, fontWeight: 600,
                      color: isSuperAdmin ? '#f5c518'
                        : user.role === 'ADMIN' ? 'var(--accent)' : 'var(--text)',
                    }}>
                      {isSuperAdmin ? '👑 Super Admin'
                        : user.role === 'ADMIN' ? '⚙️ Admin' : '👤 ' + user.name}
                    </p>
                  </div>

                  <Link href="/profile" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 6,
                    color: 'var(--text)', textDecoration: 'none', fontSize: 14,
                  }}>
                    👤 Profile
                  </Link>

                  {isAdmin && (
                    <Link href="/admin" style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 6,
                      color: 'var(--text)', textDecoration: 'none', fontSize: 14,
                    }}>
                      ⚙️ Admin Panel
                    </Link>
                  )}

                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 12px', borderRadius: 6,
                    background: 'none', border: 'none',
                    color: '#ef4444', cursor: 'pointer', fontSize: 14,
                  }}>
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
