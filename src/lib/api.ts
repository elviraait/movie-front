// src/lib/api.ts
import { getAccessToken, saveAccessToken, clearAccessToken } from "./auth";
import type { Movie, MoviesResponse, MoviesQuery, Review, User } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // Адрес NestJS

// ─── Базовая функция запроса ───────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false, // флаг чтобы не зациклиться при рефреше
): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // ВАЖНО: отправляем httpOnly cookie (refreshToken)
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // Если токен истёк — пробуем обновить
  if (response.status === 401 && !isRetry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Повторяем запрос с новым токеном
      return request<T>(endpoint, options, true);
    } else {
      // Рефреш не помог — выходим
      clearAccessToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Сессия истекла. Войдите снова.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка ${response.status}`);
  }

  // 204 No Content — сервер ничего не вернул
  if (response.status === 204) return null as T;

  return response.json();
}

// Обновляем accessToken через refreshToken (который в httpOnly cookie)
async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // браузер сам отправит httpOnly refreshToken cookie
    });
    if (!response.ok) return false;

    const data = await response.json();
    saveAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ─── AUTH ──────────────────────────────────────────────────────────────────

// POST /auth/register → { accessToken }
export async function apiRegister(
  email: string,
  password: string,
  name: string,
): Promise<{ accessToken: string }> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

// POST /auth/login → { accessToken }
export async function apiLogin(
  email: string,
  password: string,
): Promise<{ accessToken: string }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// POST /auth/logout — очищает cookie на сервере
export async function apiLogout(): Promise<void> {
  return request("/auth/logout", { method: "POST" });
}

// ─── USERS ─────────────────────────────────────────────────────────────────

// GET /users/profile → полный профиль с отзывами
export async function apiGetProfile(): Promise<User> {
  return request<User>("/users/profile");
}

// ─── MOVIES ────────────────────────────────────────────────────────────────

// GET /movies?page=1&limit=10&genre=ACTION... → { data, meta }
export async function apiGetMovies(
  query: MoviesQuery = {},
): Promise<MoviesResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.genre) params.set("genre", query.genre);
  if (query.year) params.set("year", String(query.year));
  if (query.title) params.set("title", query.title);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);

  const qs = params.toString();
  return request<MoviesResponse>(`/movies${qs ? `?${qs}` : ""}`);
}

// GET /movies/:id → один фильм
export async function apiGetMovie(id: string): Promise<Movie> {
  return request<Movie>(`/movies/${id}`);
}

// GET /movies/:id/reviews → фильм + массив отзывов с пользователями
export async function apiGetMovieWithReviews(
  id: string,
): Promise<Movie & { reviews: Review[] }> {
  return request(`/movies/${id}/reviews`);
}

// POST /movies → создать фильм (только ADMIN)
export async function apiCreateMovie(data: {
  title: string;
  description?: string;
  year: number;
  genre: string;
}): Promise<Movie> {
  return request<Movie>("/movies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// DELETE /movies/:id → удалить фильм (только ADMIN)
export async function apiDeleteMovie(id: string): Promise<void> {
  return request<void>(`/movies/${id}`, { method: "DELETE" });
}

// ─── REVIEWS ───────────────────────────────────────────────────────────────

// GET /reviews/movie/:movieId → все отзывы на фильм
export async function apiGetReviewsByMovie(movieId: string): Promise<Review[]> {
  return request<Review[]>(`/reviews/movie/${movieId}`);
}

// POST /reviews → создать отзыв (требует авторизации)
export async function apiCreateReview(data: {
  rating: number;
  comment?: string;
  movieId: string;
}): Promise<Review> {
  return request<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// DELETE /reviews/:id → удалить свой отзыв
export async function apiDeleteReview(id: string): Promise<void> {
  return request<void>(`/reviews/${id}`, { method: "DELETE" });
}
