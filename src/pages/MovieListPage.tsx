import React, { useEffect, useState, useCallback } from 'react';
import {
  Panel,
  Spinner,
  Group,
  FormLayoutGroup,
  FormItem,
  Button,
  PanelHeader,
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
    <Panel 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
      }}
    >
      <PanelHeader>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
          }}
        >
          <span 
            style={{ 
              fontWeight: 500, 
              fontSize: 20, 
              flex: 1, 
            }}
          >Список фильмов</span>
          <Button 
            mode="tertiary" 
            size="l" 
            style={{ paddingBottom: 2 }} 
            onClick={() => navigate('/favorites')}
          >
            Избранное
          </Button>
        </div>
      </PanelHeader>

      <div 
        style={{ 
          display: 'flex', 
          flexGrow: 1, 
          padding: 16, 
          gap: 24, 
        }}
      >
        <div 
          style={{ 
            width: 280, 
            flexShrink: 0, 
            position: 'sticky', 
            top: 80, 
            alignSelf: 'flex-start' 
          }}
        >
          <Group mode="card" style={{ padding: 16, borderRadius: 8 }}>
            <FormLayoutGroup mode="vertical" style={{ gap: 12 }}>
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

              <FormItem top="Жанры">
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

              <FormItem>
                <Button 
                  style={{ paddingBottom: 2 }} 
                  onClick={applyFilters} 
                  size="l" 
                  stretched
                >
                  Применить
                </Button>
              </FormItem>
            </FormLayoutGroup>
          </Group>
        </div>

        <div style={{ flex: 1 }}>
          {error && (
            <Group>
              <div style={{ padding: 16, color: 'red' }}>{error}</div>
            </Group>
          )}

          <Group style={{ padding: 10 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 24,
                width: '100%',
              }}
            >
              {movies.map((movie, index) => {
                const posterUrl = movie.poster?.previewUrl || movie.poster?.url;

                return (
                  <div
                    key={`${movie.id}-${index}`}
                    onClick={() => navigate(`/movies/${movie.id}`)}
                    style={{
                      padding: 8,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderRadius: 8,
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = '#f0f0f0';
                    }}

                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = '#fff';
                    }}
                  >
                    <div 
                      style={{ 
                        position: 'relative', 
                        width: '100%', 
                        marginBottom: 8, 
                      }}
                    >
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={movie.name}
                          style={{
                            width: '100%',
                            height: 350,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: 350,
                            fontSize: 40,
                            lineHeight: '350px',
                            textAlign: 'center',
                            backgroundColor: '#f0f0f0',
                            borderRadius: 8,
                          }}
                        >
                          🎬
                        </div>
                      )}

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
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '50%',
                          padding: 4,
                          cursor: 'pointer',
                          zIndex: 1,
                        }}
                        aria-label={isFavorite(movie.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      >
                        {isFavorite(movie.id) ? (
                          <Icon28Hearts2 fill="#ff0000" width={24} height={24} />
                        ) : (
                          <Icon28Hearts2Outline width={24} height={24} />
                        )}
                      </div>
                    </div>

                    <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{movie.name}</div>
                    <div style={{ flexGrow: 1 }} />

                    <div
                      style={{
                        fontSize: 12,
                        color: '#888',
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                        marginTop: 10,
                      }}
                    >
                      <span>{movie.year}</span>
                      {movie.rating?.kp && <span>⭐ {movie.rating.kp.toFixed(1)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <Spinner />
              </div>
            )}
          </Group>
        </div>
      </div>
    </Panel>
  );
};

export default MovieListPage;