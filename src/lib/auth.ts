import Cookies from 'js-cookie';
import type { Role } from '@/types';

const TOKEN_KEY = 'access_token';
const USER_KEY  = 'user_info';

// ── Token ─────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 1 / 8, sameSite: 'lax' });
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── User info — stored in BOTH cookie (for SSR) and localStorage ──
export function getUserInfo(): { id: string; name: string; email: string; role: Role } | null {
  if (typeof window === 'undefined') return null;
  try {
    // Try localStorage first (most up-to-date), fall back to cookie
    const raw = localStorage.getItem(USER_KEY) || Cookies.get(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveUserInfo(info: { id: string; name: string; email: string; role: Role }): void {
  const json = JSON.stringify(info);
  localStorage.setItem(USER_KEY, json);
  // Also save to cookie so server components / layout can read it without API call
  Cookies.set(USER_KEY, json, { expires: 1 / 8, sameSite: 'lax' });
}

// ── Server-side helper (called from Server Components / layout) ────
export function getUserInfoFromCookieHeader(cookieHeader: string | null): {
  id: string; name: string; email: string; role: Role;
} | null {
  if (!cookieHeader) return null;
  try {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${USER_KEY}=([^;]*)`));
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match[1]));
  } catch { return null; }
}

// ── Role helpers ──────────────────────────────────────────────────
export function isAdmin(): boolean {
  const role = getUserInfo()?.role;
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(): boolean {
  return getUserInfo()?.role === 'SUPER_ADMIN';
}