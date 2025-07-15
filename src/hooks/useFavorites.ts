import { useState, useEffect, useCallback } from 'react';

export interface FavoriteMovie {
  id: number;
  name: string;
  poster?: { previewUrl?: string; url?: string };
  year?: number;
  rating?: { kp?: number };
}

const STORAGE_KEY = 'favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Ошибка при загрузке избранного из localStorage:', e);
    }
  }, []);

  const saveToStorage = useCallback((items: FavoriteMovie[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Ошибка при сохранении избранного:', e);
    }
  }, []);

  const addFavorite = useCallback((movie: FavoriteMovie) => {
    if (!favorites.some((m) => m.id === movie.id)) {
      const updated = [...favorites, movie];
      setFavorites(updated);
      saveToStorage(updated);
    }
  }, [favorites, saveToStorage]);

  const removeFavorite = useCallback((id: number) => {
    const updated = favorites.filter((m) => m.id !== id);
    setFavorites(updated);
    saveToStorage(updated);
  }, [favorites, saveToStorage]);

  const isFavorite = useCallback(
    (id: number) => favorites.some((m) => m.id === id),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
