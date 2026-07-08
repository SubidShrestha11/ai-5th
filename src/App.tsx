import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthModal } from '@/components/auth/AuthModal';
import { LogMovieModal } from '@/components/movies/LogMovieModal';
import { AuthBootstrap } from '@/providers/AuthBootstrap';
import { HomePage } from '@/pages/HomePage';
import { MovieDetailPage } from '@/pages/MovieDetailPage';
import { FeedPage } from '@/pages/FeedPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SearchPage } from '@/pages/SearchPage';

function SearchRoute() {
  const location = useLocation();
  return <SearchPage key={location.key} />;
}

function AppRoutes() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/search" element={<SearchRoute />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </Layout>
      <AuthModal />
      <LogMovieModal />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </BrowserRouter>
  );
}

export default App;
