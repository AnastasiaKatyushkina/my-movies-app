import React, { useEffect, useState } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  SimpleCell,
  Button,
  Spinner,
  ModalRoot,
  ModalCard,
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
    <Panel>
      <PanelHeader>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Button
            mode="tertiary"
            size="s"
            onClick={() => navigate('/')}
            style={{ marginRight: 8 }}
          >
            ←
          </Button>
          <span style={{ fontWeight: 500, fontSize: 16 }}>Избранное</span>
        </div>
      </PanelHeader>

      {favorites.length === 0 ? (
        <Group>
          <SimpleCell disabled>Список избранного пуст.</SimpleCell>
        </Group>
      ) : (
        <Group>
          {favorites.slice(0, visibleCount).map((movie) => (
            <SimpleCell
              key={movie.id}
              onClick={() => navigate(`/movie/${movie.id}`)}
              before={
                movie.poster?.previewUrl ? (
                  <img
                    src={movie.poster.previewUrl}
                    alt={movie.name}
                    style={{ width: 50, height: 75, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <span style={{ fontSize: 40, lineHeight: '75px' }}>🎬</span>
                )
              }
              after={
                <Button
                  appearance="negative"
                  size="m"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmRemove(movie.id);
                  }}
                >
                  Удалить
                </Button>
              }
            >
              {movie.name}
            </SimpleCell>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
              <Spinner />
            </div>
          )}
        </Group>
      )}

      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id="confirmRemove"
          onClose={() => setActiveModal(null)}
          actions={[
            <Button
              key="cancel"
              mode="secondary"
              onClick={() => setActiveModal(null)}
            >
              Отмена
            </Button>,
            <Button
              key="delete"
              appearance="negative"
              onClick={handleRemove}
            >
              Удалить
            </Button>,
          ]}
        >
          <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
            Подтверждение удаления
          </div>
          Вы действительно хотите удалить фильм из избранного?
        </ModalCard>
      </ModalRoot>
    </Panel>
  );
};

export default FavoritesPage;
