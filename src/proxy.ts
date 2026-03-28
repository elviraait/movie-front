// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Страницы только для авторизованных пользователей
const PROTECTED = ['/profile'];

// Страницы только для НЕавторизованных (если зашёл — редирект на главную)
const AUTH_ONLY = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const path = request.nextUrl.pathname;

  // Нет токена + пытается зайти на защищённую страницу
  if (PROTECTED.includes(path) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Есть токен + пытается зайти на /login или /register
  if (AUTH_ONLY.includes(path) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// На каких путях запускать middleware
export const config = {
  matcher: ['/profile', '/login', '/register'],
};