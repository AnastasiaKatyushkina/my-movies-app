import React, { useEffect, useState } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  SimpleCell,
  Spinner,
  Button,
  ModalRoot,
  ModalCard,
} from '@vkontakte/vkui';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMovieById } from '../api/kinopoisk';
import { useFavorites } from '../hooks/useFavorites';

interface Movie {
  id: number;
  name: string;
  description?: string;
  year?: number;
  countries?: { name: string }[];
  genres?: { name: string }[];
  rating?: {
    kp?: number;
  };
  poster?: {
    previewUrl?: string;
    url?: string;
  };
  similarMovies?: { id: number; name: string; poster?: { previewUrl?: string } }[];
}

const MovieDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { addFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMovieById(id!);
        setMovie(data);
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        setError(`Ошибка загрузки фильма: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <Panel>
        <PanelHeader>Загрузка...</PanelHeader>
        <Group><Spinner /></Group>
      </Panel>
    );
  }

  if (error || !movie) {
    return (
      <Panel>
        <PanelHeader>Ошибка</PanelHeader>
        <Group><SimpleCell disabled>{error}</SimpleCell></Group>
      </Panel>
    );
  }

  return (
    <Panel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', fontWeight: 'bold', fontSize: 18 }}>
        <span>Фильм: {movie.name}</span>
        <Button mode="tertiary" size="s" onClick={() => navigate('/favorites')}>
          Избранное
        </Button>
      </div>

      <Group>
        <Button onClick={() => navigate(-1)} mode="secondary" style={{ marginBottom: 16 }}>
          ← Назад
        </Button>
        
        {movie.poster?.url && (
          <img
            src={movie.poster.url}
            alt={movie.name}
            style={{ width: '100%', maxWidth: 300, borderRadius: 8 }}
          />
        )}
        <SimpleCell disabled>Год: {movie.year ?? '-'}</SimpleCell>
        <SimpleCell disabled>Рейтинг: {movie.rating?.kp?.toFixed(1) ?? '-'}</SimpleCell>
        <SimpleCell disabled>Страны: {movie.countries?.map(c => c.name).join(', ')}</SimpleCell>
        <SimpleCell disabled>Жанры: {movie.genres?.map(g => g.name).join(', ')}</SimpleCell>
        <SimpleCell multiline>{movie.description ?? 'Описание отсутствует'}</SimpleCell>

        {!isFavorite(movie.id) && (
          <Button
            size="l"
            stretched
            style={{ marginTop: 16 }}
            onClick={() => setActiveModal('addToFavorites')}
          >
            Добавить в избранное
          </Button>
        )}
      </Group>

      {movie.similarMovies?.length ? (
        <Group header={<div style={{ padding: '8px 12px', fontWeight: 'bold' }}>Похожие фильмы</div>}>
          {movie.similarMovies.map((sim) => (
            <SimpleCell
              key={sim.id}
              onClick={() => navigate(`/movies/${sim.id}`)}
              before={
                sim.poster?.previewUrl ? (
                  <img
                    src={sim.poster.previewUrl}
                    alt={sim.name}
                    style={{ width: 50, height: 75, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <span style={{ fontSize: 40, lineHeight: '75px' }}>🎬</span>
                )
              }
            >
              {sim.name}
            </SimpleCell>
          ))}
        </Group>
      ) : null}

      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id="addToFavorites"
          onClose={() => setActiveModal(null)}
        >
          <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
            Добавить фильм в избранное?
          </div>
          <div>
            Фильм «{movie.name}» будет добавлен в список избранного.
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              mode="secondary"
              style={{ marginRight: 8 }}
              onClick={() => setActiveModal(null)}
            >
              Отмена
            </Button>
            <Button
              mode="primary"
              onClick={() => {
                if (movie) {
                  addFavorite({
                    id: movie.id,
                    name: movie.name,
                    poster: movie.poster,
                    year: movie.year,
                    rating: movie.rating,
                  });
                }
                setActiveModal(null);
              }}
            >
              Добавить
            </Button>
          </div>
        </ModalCard>
      </ModalRoot>
    </Panel>
  );
};

export default MovieDetailPage;
