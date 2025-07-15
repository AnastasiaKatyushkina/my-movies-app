import React, { useEffect, useState } from 'react';
import {
  Panel,
  PanelHeader,
  Button,
  Spinner,
  ModalRoot,
  ModalCard,
  Group,
} from '@vkontakte/vkui';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

const FavoritesPage: React.FC = () => {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toRemoveId, setToRemoveId] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10 &&
        !loading &&
        visibleCount < favorites.length
      ) {
        setLoading(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + 50);
          setLoading(false);
        }, 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, loading, favorites.length]);

  const confirmRemove = (id: number) => {
    setToRemoveId(id);
    setActiveModal('confirmRemove');
  };

  const handleRemove = () => {
    if (toRemoveId !== null) {
      removeFavorite(toRemoveId);
    }
    setActiveModal(null);
    setToRemoveId(null);
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
          <Button
            mode="tertiary"
            size="l"
            onClick={() => navigate(-1)}
            style={{ marginRight: 20, paddingBottom: 2 }}
          >
            Назад
          </Button>
          <span style={{ fontWeight: 500, fontSize: 20 }}>Избранное</span>
        </div>
      </PanelHeader>

      {favorites.length === 0 ? (
        <Group 
          style={{ 
            height: '100%', 
            margin: 24, 
            marginTop: 16, 
            }}
          >
          <div 
            style={{ 
              display: 'flex',
              justifyContent: 'center',
              padding: 16, 
              fontSize: 24, 
              alignItems: 'center', 
              width: '100%', 
              height: '50%',
              textAlign: 'center',
            }}>
              Список избранного пуст(. <br />
              Добовьте, чтобы можно было возвращаться к любимым фильмам 
            </div>
        </Group>
      ) : (
        <div style={{ padding: 24, paddingTop: 8 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 24,
                width: '100%',
              }}
            >
              {favorites.slice(0, visibleCount).map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movies/${movie.id}`)}
                  style={{
                    padding: 8,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#f9f9f9';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {movie.poster?.previewUrl ? (
                    <img
                      src={movie.poster.previewUrl}
                      alt={movie.name}
                      style={{
                        width: '100%',
                        height: 250,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 180,
                        fontSize: 40,
                        lineHeight: '180px',
                        textAlign: 'center',
                      }}
                    >
                      🎬
                    </div>
                  )}
                  <div 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {movie.name}
                    </div>
                    <div style={{ flexGrow: 1 }} />
                    <div 
                      style={{ 
                        fontSize: 12, 
                        color: '#888', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        marginTop: 10,
                      }}>
                      <span>{movie.year}</span>
                      {movie.rating?.kp && <span>⭐️ {movie.rating.kp.toFixed(1)}</span>}
                    </div>
                  </div>
                  <Button
                    appearance="negative"
                    size="s"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmRemove(movie.id);
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              ))}

              {loading && (
                <div 
                  style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: 16 
                  }}>
                  <Spinner />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id="confirmRemove"
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
              key="delete" 
              appearance="negative" 
              style={{ paddingBottom: 2 }} 
              onClick={handleRemove}
            >
              Удалить
            </Button>,
          ]}
        >
          <div 
            style={{ 
              fontWeight: 'bold', 
              fontSize: 20, 
              marginBottom: 16 
            }}
          >
            Подтверждение удаления
          </div>
          Вы действительно хотите удалить фильм из избранного?
        </ModalCard>
      </ModalRoot>
    </Panel>
  );
};

export default FavoritesPage;
