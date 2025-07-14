import { Routes, Route, Navigate } from 'react-router-dom';
import MovieListPage from '../pages/MovieListPage';
import MovieDetailsPage from '../pages/MovieDetailsPage';
import FavoritesPage from '../pages/FavoritesPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/movies" />} />
      <Route path="/movies" element={<MovieListPage />} />
      <Route path="/movies/:id" element={<MovieDetailsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

