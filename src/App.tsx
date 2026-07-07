import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthModal } from '@/components/auth/AuthModal';
import { LogMovieModal } from '@/components/movies/LogMovieModal';
import { HomePage } from '@/pages/HomePage';
import { MovieDetailPage } from '@/pages/MovieDetailPage';
import { FeedPage } from '@/pages/FeedPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SearchPage } from '@/pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </Layout>
      <AuthModal />
      <LogMovieModal />
    </BrowserRouter>
  );
}

export default App;
