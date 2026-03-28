// src/lib/auth.ts
import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';

// Сохраняем accessToken в cookie на 3 часа
export function saveAccessToken(token: string) {
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: 3 / 24,  // 3 час (3/24 от суток)
    sameSite: 'lax',
  });
}

// Читаем accessToken из cookie
export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

// Удаляем accessToken (при выходе)
export function clearAccessToken() {
  Cookies.remove(ACCESS_TOKEN_KEY);
}

// Проверяем: есть ли токен (= авторизован ли пользователь)
export function isAuthenticated(): boolean {
  return !!Cookies.get(ACCESS_TOKEN_KEY);
}