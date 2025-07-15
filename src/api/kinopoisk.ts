import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'X-API-KEY': import.meta.env.VITE_KINOPOISK_TOKEN,
  },
});

async function fetchWithRetry<T>(
  url: string,
  options: AxiosRequestConfig,
  retries = 3,
  delay = 1500
): Promise<AxiosResponse<T>> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await API.get<T>(url, options);
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error('Не удалось выполнить запрос после нескольких попыток');
}

interface Movie {
  id: number;
  name: string;
  year?: number;
  rating?: { kp?: number };
  poster?: { previewUrl?: string; url?: string };
}

interface FetchMoviesResponse {
  docs: Movie[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

export const fetchMovies = async (
  page: number = 1,
  limit: number = 50,
  extraParams: Record<string, unknown> = {}
): Promise<FetchMoviesResponse> => {
  const params = {
    page,
    limit,
    type: 'movie',
    year: '1990-2025',
    sortField: 'rating.kp',
    sortType: -1,
    ...extraParams,
  };

  const response = await fetchWithRetry<FetchMoviesResponse>('/v1.4/movie', { params });
  return response.data;
};

export const fetchMovieById = async (id: string): Promise<Movie> => {
  const response = await fetchWithRetry<Movie>(`/v1.4/movie/${id}`, {});
  return response.data;
};
