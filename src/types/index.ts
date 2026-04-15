export type Genre = 'ACTION' | 'COMEDY' | 'DRAMA' | 'HORROR' | 'SCI_FI';
export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
  reviews?: UserReview[];
  _count?: { reviews: number };
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  movie: { id: string; title: string };
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  year: number;
  genre: Genre;
  posterUrl: string | null;
  createdAt: string;
  _count?: { reviews: number };
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  movieId: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string };
}

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

export interface MoviesQuery {
  page?: number;
  limit?: number;
  genre?: Genre;
  year?: number;
  title?: string;
  sortBy?: 'title' | 'year' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface AdminStats {
  overview: {
    totalMovies: number;
    totalUsers: number;
    totalReviews: number;
    avgRating: number;
    reviewsThisMonth: number;
    reviewsLastMonth: number;
    reviewsGrowth: number;
    newUsersThisMonth: number;
    newMoviesThisMonth: number;
  };
  moviesByGenre: { genre: Genre; count: number }[];
  recentMovies: Movie[];
  recentUsers: User[];
  topRatedMovies: {
    id: string; title: string; genre: Genre; year: number;
    posterUrl: string | null; reviewCount: number; avgRating: number;
  }[];
}
