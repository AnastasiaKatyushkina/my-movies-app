import React, { useEffect, useState, useCallback } from 'react';
import {
  Panel,
  SimpleCell,
  Spinner,
  Group,
  FormLayoutGroup,
  FormItem,
  Button,
} from '@vkontakte/vkui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchMovies } from '../api/kinopoisk';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { Icon28Hearts2Outline, Icon28Hearts2 } from '@vkontakte/icons';
import { useFavorites } from '../hooks/useFavorites';

interface Movie {
  id: number;
  name: string;
  year?: number;
  rating?: {
    kp?: number;
  };
  poster?: {
    previewUrl?: string;
    url?: string;
  } | null;
}

type GenreOption = {
  value: string;
  label: string;
};

const genresOptions: GenreOption[] = [
  { label: 'Комедия', value: 'комедия' },
  { label: 'Драма', value: 'драма' },
  { label: 'Боевик', value: 'боевик' },
  { label: 'Фантастика', value: 'фантастика' },
  { label: 'Ужасы', value: 'ужасы' },
];

const MovieListPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 10]);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, 2025]);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const loadMovies = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const genreParam = selectedGenres.join(',') || undefined;

      const data = await fetchMovies(page, 50, {
        year: `${yearRange[0]}-${yearRange[1]}`,
        'rating.kp': `${ratingRange[0]}-${ratingRange[1]}`,
        genres: genreParam,
        sortField: 'rating.kp',
        sortType: -1,
      });

      if (Array.isArray(data.docs)) {
        const filteredDocs = data.docs.filter(
          (m: Movie) => m.name && m.name.trim() !== '' && m.poster?.previewUrl
        );
        setMovies((prev) => [...prev, ...filteredDocs]);
        setHasMore(data.docs.length === 50);
        setPage((prev) => prev + 1);
      } else {
        setError('Некорректный формат данных с API');
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, selectedGenres, ratingRange, yearRange]);

  useEffect(() => {
    const genres = searchParams.get('genres');
    const rating = searchParams.get('rating');
    const year = searchParams.get('year');

    if (genres) setSelectedGenres(genres.split(','));
    else setSelectedGenres([]);

    if (rating) {
      const [min, max] = rating.split('-').map(Number);
      setRatingRange([min, max] as [number, number]);
    } else {
      setRatingRange([0, 10]);
    }

    if (year) {
      const [min, max] = year.split('-').map(Number);
      setYearRange([min, max] as [number, number]);
    } else {
      setYearRange([1990, 2025]);
    }

    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [searchParams]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10 &&
        !loading &&
        hasMore
      ) {
        setTimeout(() => {
          loadMovies();
        }, 500);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMovies, loading, hasMore]);

  const applyFilters = () => {
    const params: Record<string, string> = {};

    if (selectedGenres.length > 0) {
      params.genres = selectedGenres.join(',');
    }

    if (ratingRange[0] !== 0 || ratingRange[1] !== 10) {
      params.rating = `${ratingRange[0]}-${ratingRange[1]}`;
    }

    if (yearRange[0] !== 1990 || yearRange[1] !== 2025) {
      params.year = `${yearRange[0]}-${yearRange[1]}`;
    }

    setSearchParams(params);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    loadMovies();
  };

  return (
    <Panel>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          fontWeight: 'bold',
          fontSize: 18,
        }}
      >
        <span>Список фильмов</span>
        <Button mode="tertiary" onClick={() => navigate('/favorites')}>
          Избранное
        </Button>
      </div>

      <FormLayoutGroup mode="horizontal">
        <FormItem top="Жанры" style={{ minWidth: 200 }}>
          <Select
            isMulti
            options={genresOptions}
            placeholder="Выберите жанры"
            value={genresOptions.filter((opt) => selectedGenres.includes(opt.value))}
            onChange={(selected: MultiValue<GenreOption>) => {
              const values = selected.map((opt) => opt.value);
              setSelectedGenres(values);
            }}
          />
        </FormItem>
        <FormItem top={`Рейтинг: ${ratingRange[0]} – ${ratingRange[1]}`}>
          <Slider
            range
            min={0}
            max={10}
            step={0.1}
            value={ratingRange}
            onChange={(value) => setRatingRange(value as [number, number])}
          />
        </FormItem>
        <FormItem top={`Год: ${yearRange[0]} – ${yearRange[1]}`}>
          <Slider
            range
            min={1990}
            max={2025}
            step={1}
            value={yearRange}
            onChange={(value) => setYearRange(value as [number, number])}
          />
        </FormItem>
        <FormItem>
          <Button onClick={applyFilters}>Применить</Button>
        </FormItem>
      </FormLayoutGroup>

      {error && (
        <Group>
          <SimpleCell disabled>Ошибка: {error}</SimpleCell>
        </Group>
      )}

      <Group>
        {movies.map((movie, index) => {
          const posterUrl = movie.poster?.previewUrl || movie.poster?.url;

          return (
            <SimpleCell
              key={`${movie.id}-${index}`}
              onClick={() => navigate(`/movies/${movie.id}`)}
              before={
                posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={movie.name}
                    style={{ width: 50, height: 75, objectFit: 'cover', borderRadius: 4 }}
                    loading="lazy"
                  />
                ) : (
                  <span style={{ fontSize: 40, lineHeight: '75px' }}>🎬</span>
                )
              }
              after={
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFavorite(movie.id)) {
                      removeFavorite(movie.id);
                    } else {
                      addFavorite({
                        id: movie.id,
                        name: movie.name,
                        poster: movie.poster ?? undefined,
                        year: movie.year,
                        rating: movie.rating,
                      });
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                  aria-label={isFavorite(movie.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  {isFavorite(movie.id) ? (
                    <Icon28Hearts2 fill="#ff0000" />
                  ) : (
                    <Icon28Hearts2Outline />
                  )}
                </div>
              }
            >
              {movie.name} ({movie.year ?? '-'}) — рейтинг:{' '}
              {movie.rating?.kp && movie.rating.kp > 0 ? movie.rating.kp.toFixed(1) : '-'}
            </SimpleCell>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <Spinner />
          </div>
        )}
      </Group>
    </Panel>
  );
};

export default MovieListPage;
