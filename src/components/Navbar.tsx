'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { getAccessToken, getUserInfo, clearAccessToken, isAdmin, isSuperAdmin, saveUserInfo } from '@/lib/auth';
import { apiGetProfile, apiLogout } from '@/lib/api';

export function Navbar() {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setUser(null); return; }
    const cached = getUserInfo();
    if (cached) { setUser(cached); return; }
    apiGetProfile().then(p => {
      saveUserInfo({ id: p.id, name: p.name, email: p.email, role: p.role });
      setUser(p);
    }).catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await apiLogout();
    clearAccessToken();
    setUser(null);
    router.push('/login');
  };

  // Only read client-only auth state after mount
  const adminAccess = mounted && isAdmin();
  const superAdminAccess = mounted && isSuperAdmin();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'Bebas Neue, cursive', fontSize: 24, letterSpacing: 2,
          color: 'var(--accent)', lineHeight: 1,
        }}>CINEVAULT</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {adminAccess && (
          <Link href="/admin" className="btn btn-ghost btn-sm" style={{
            borderColor: superAdminAccess ? 'rgba(245,197,24,0.4)' : 'var(--border)',
            color: superAdminAccess ? '#f5c518' : 'var(--text-muted)',
          }}>
            {superAdminAccess ? '👑' : '⚙️'} Admin
          </Link>
        )}

        <button onClick={toggle} style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--text)',
          fontSize: 16, lineHeight: 1,
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Gate the entire auth section on mounted to avoid SSR mismatch */}
        {!mounted ? (
          // Render a placeholder with the same dimensions so layout doesn't shift
          <div style={{ width: 80, height: 34 }} />
        ) : user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: superAdminAccess ? 'rgba(245,197,24,0.15)' : 'var(--accent)',
                border: superAdminAccess ? '1px solid rgba(245,197,24,0.5)' : 'none',
                borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                color: superAdminAccess ? '#f5c518' : '#fff',
                fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {superAdminAccess ? '👑' : ''} {user.name.split(' ')[0]} ▾
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 8, minWidth: 180,
                boxShadow: 'var(--shadow-lg)', zIndex: 200,
              }}>
                <div style={{ padding: '6px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Signed in as</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: superAdminAccess ? '#f5c518' : user.role === 'ADMIN' ? 'var(--accent)' : 'var(--text)' }}>
                    {superAdminAccess ? '👑 Super Admin' : user.role === 'ADMIN' ? '⚙️ Admin' : '👤 User'}
                  </p>
                </div>
                <Link href="/profile" onClick={() => setMenuOpen(false)} style={{
                  display: 'block', padding: '8px 12px', borderRadius: 6,
                  color: 'var(--text)', textDecoration: 'none', fontSize: 14,
                }}>👤 Profile</Link>
                {adminAccess && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} style={{
                    display: 'block', padding: '8px 12px', borderRadius: 6,
                    color: 'var(--text)', textDecoration: 'none', fontSize: 14,
                  }}>⚙️ Admin Panel</Link>
                )}
                <button onClick={handleLogout} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', borderRadius: 6, background: 'none', border: 'none',
                  color: '#ef4444', cursor: 'pointer', fontSize: 14, marginTop: 2,
                }}>🚪 Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
