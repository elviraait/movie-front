// src/types/index.ts

// Жанры — ровно те что в твоей Prisma схеме
export type Genre = 'ACTION' | 'COMEDY' | 'DRAMA' | 'HORROR' | 'SCI_FI';

// Роли пользователей
export type Role = 'USER' | 'ADMIN';

// Пользователь
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  reviews?: UserReview[]; // только в профиле
}

// Отзыв внутри профиля пользователя
export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  movie: {
    id: string;
    title: string;
  };
  createdAt: string;
}

// Фильм
export interface Movie {
  id: string;
  title: string;
  description: string | null;
  year: number;
  genre: Genre;
  createdAt: string;
  _count?: {
    reviews: number;   // добавляется бэкендом при запросе списка
  };
}

// Отзыв на фильм
export interface Review {
  id: string;
  rating: number;
  comment: string | null;  // ВАЖНО: comment, не content!
  movieId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

// Ответ от GET /movies (с пагинацией)
export interface MoviesResponse {
  data: Movie[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Параметры фильтрации
export interface MoviesQuery {
  page?: number;
  limit?: number;
  genre?: Genre;
  year?: number;
  title?: string;
  sortBy?: 'title' | 'year' | 'createdAt';
  order?: 'asc' | 'desc';
}