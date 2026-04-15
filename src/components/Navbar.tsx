'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { getAccessToken, getUserInfo, clearAccessToken, isAdmin, isSuperAdmin, saveUserInfo } from '@/lib/auth';
import { apiGetProfile, apiLogout } from '@/lib/api';

type UserInfo = { name: string; role: string } | null;

interface NavbarProps {
  // Passed from the Server Component layout — avoids client-side fetch on first load
  initialUser?: { id: string; name: string; email: string; role: string } | null;
}

export function Navbar({ initialUser }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const router = useRouter();

  // If server already gave us the user, start with it — no flash, no delay
  const [user, setUser] = useState<UserInfo>(initialUser ?? null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Only need mounted guard if we didn't get initialUser from server
  const [mounted, setMounted] = useState(!!initialUser);

  useEffect(() => {
    setMounted(true);
    const token = getAccessToken();
    if (!token) { setUser(null); return; }

    // Use localStorage cache — no network request if already have data
    const cached = getUserInfo();
    if (cached) { setUser(cached); return; }

    // Only hits network on very first load (no cache yet)
    apiGetProfile().then(p => {
      saveUserInfo({ id: p.id, name: p.name, email: p.email, role: p.role });
      setUser(p);
    }).catch(() => setUser(null));
  }, []); // ← no pathname dep: profile doesn't change on navigation

  const handleLogout = async () => {
    await apiLogout();
    clearAccessToken();
    setUser(null);
    router.push('/login');
  };

  const adminAccess  = mounted && isAdmin();
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

        {!mounted ? (
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
