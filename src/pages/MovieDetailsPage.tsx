import React, { useEffect, useState } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
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
      <Group style={{ margin: 24 }}>
        <div 
          style={{ 
            padding: 16, 
            fontSize: 24, 
            width: '100%', 
            height: '50%',
            textAlign: 'center',
          }}>
            Загрузка...
        </div>
        <Spinner style={{ marginTop: 20 }} />
      </Group>      
    );
  }

  if (error || !movie) {
    return (
      <Group style={{ margin: 24 }}>
        <div 
          style={{ 
            padding: 16, 
            fontSize: 24, 
            width: '100%', 
            height: '50%',
            textAlign: 'center',
          }}>
            Ошибка
        </div>
        <div 
          style={{ 
            textAlign: 'center', 
            color: 'red', 
            marginTop: 8, 
          }}
        >{error}</div>
      </Group> 
    );
  }

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
            justifyContent: 'space-between', 
            padding: '12px 16px', 
            fontWeight: 'bold', 
            fontSize: 18,  
          }}
        >
          <Button
            mode="tertiary"
            size="l"
            onClick={() => navigate(-1)}
            style={{ marginRight: 20, paddingBottom: 2 }}
          >
            Назад
          </Button>
          <span 
            style={{ 
              fontWeight: 500, 
              fontSize: 20, 
              flex: 1 
            }}
          >Фильм: {movie.name}</span>
          <Button 
            mode="tertiary" 
            size="l" 
            style={{ paddingBottom: 2, marginRight: 30 }} 
            onClick={() => navigate('/favorites')}
          >
            Избранное
          </Button>
        </div>
      </PanelHeader>

      <Group 
        style={{
          margin: 24,
          padding: 24,
          display: 'flex',
          flexDirection: 'row',
          gap: 24,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >   
        {movie.poster?.url && (
          <img
            src={movie.poster.url}
            alt={movie.name}
            style={{ 
              width: 240,
              height: 'auto',
              objectFit: 'cover',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{movie.name}</div>
          <div style={{ marginBottom: 8, fontSize: 16 }}>Год: {movie.year ?? '-'}</div>
          <div style={{ marginBottom: 8, fontSize: 16 }}>Рейтинг: {movie.rating?.kp?.toFixed(1) ?? '-'}</div>
          <div style={{ marginBottom: 8, fontSize: 16 }}>Страны: {movie.countries?.map(c => c.name).join(', ')}</div>
          <div style={{ marginBottom: 8, fontSize: 16 }}>Жанры: {movie.genres?.map(g => g.name).join(', ')}</div>
          <div 
            style={{ 
              marginTop: 12, 
              fontSize: 15, 
              color: '#444',
            }}
          >{movie.description ?? ' '}</div>

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
        </div>
      </Group>

      {movie.similarMovies?.length ? (
        <Group style={{ padding: 24, margin: 16, marginTop: 0 }}>
          <div 
            style={{ 
              fontWeight: 'bold', 
              fontSize: 18, 
              marginBottom: 12,
            }}
          >Похожие фильмы</div>
          <div 
            style={{
              display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 16,
            }}
          >
            {movie.similarMovies.map((sim) => (
              <div
                key={sim.id}
                onClick={() => navigate(`/movies/${sim.id}`)}
                style={{
                  cursor: 'pointer',
                  background: '#f9f9f9',
                  padding: 8,
                  borderRadius: 8,
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                {sim.poster?.previewUrl ? (
                  <img
                    src={sim.poster.previewUrl}
                    alt={sim.name}
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 40, lineHeight: '180px' }}>🎬</div>
                )}
                <div style={{ fontSize: 14 }}>{sim.name}</div>
              </div>
            ))}
          </div>
        </Group>
      ) : null}

      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id="addToFavorites"
          onClose={() => setActiveModal(null)}
          actions={[
            <Button 
              key="cancel" 
              mode="secondary" 
              style={{ marginRight: 20, paddingBottom: 2 }} 
              onClick={() => setActiveModal(null)}
            >
              Отмена
            </Button>,
            <Button 
              key="add" 
              appearance="positive" 
              style={{ paddingBottom: 2 }} 
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
            </Button>,
          ]}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Добавить в избранное
          </div>
          Вы действительно хотите добавить фильм «{movie?.name}» в избранное?
        </ModalCard>
      </ModalRoot>
    </Panel>
  );
};

export default MovieDetailPage;
