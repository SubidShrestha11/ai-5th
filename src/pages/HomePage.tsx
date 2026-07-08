import { Film, Sparkles } from 'lucide-react';
import { FeaturedMovie } from '@/components/movies/FeaturedMovie';
import { MovieCarousel } from '@/components/movies/MovieCarousel';
import { Button } from '@/components/ui';
import { useTrending, useTopRated, usePopular } from '@/hooks/useMovies';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { movies: trending, loading: trendingLoading, error: trendingError } = useTrending();
  const { movies: topRated, loading: topRatedLoading, error: topRatedError } = useTopRated();
  const { movies: popular, loading: popularLoading, error: popularError } = usePopular();
  const {
    movies: suggestions,
    loading: suggestionsLoading,
    error: suggestionsError,
  } = useSuggestions();

  const featured = trending[0] ?? popular[0] ?? null;

  return (
    <div className="space-y-12">
      {!isAuthenticated && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101827] via-[#162032] to-[#101827] border border-white/8 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" aria-hidden />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-300/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" aria-hidden />
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <Film size={20} className="text-sky-300" />
              <span className="text-sm font-semibold text-sky-300 uppercase tracking-widest">
                Letterboxd Lite
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-white leading-tight mb-4">
              Your cinematic{' '}
              <span className="gradient-text">journal</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Log films, write reviews, follow friends, and discover your next obsession.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="primary"
                size="lg"
                onClick={() => openAuthModal('register')}
                icon={<Sparkles size={18} />}
              >
                Start for free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => openAuthModal('login')}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      )}

      {featured && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-sky-300" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              Featured Film
            </h2>
          </div>
          <FeaturedMovie movie={featured} />
        </section>
      )}

      <MovieCarousel
        title="Trending This Week"
        subtitle="What the world is watching"
        movies={trending}
        loading={trendingLoading}
        error={trendingError}
        cardSize="md"
      />

      {isAuthenticated && (
        <MovieCarousel
          title="Recommended For You"
          subtitle="Popular picks you haven't logged yet"
          movies={suggestions}
          loading={suggestionsLoading}
          error={suggestionsError}
          cardSize="md"
        />
      )}

      <MovieCarousel
        title="All-Time Classics"
        subtitle="The highest rated films on TMDB"
        movies={topRated}
        loading={topRatedLoading}
        error={topRatedError}
        cardSize="md"
      />

      <MovieCarousel
        title="Popular Now"
        subtitle="What everyone is talking about"
        movies={popular}
        loading={popularLoading}
        error={popularError}
        cardSize="md"
      />

      {!isAuthenticated && (
        <div className="text-center py-8 border-t border-white/8">
          <p className="text-slate-400 mb-4">
            Join thousands of film lovers already on Letterboxd Lite
          </p>
          <Button variant="primary" size="md" onClick={() => openAuthModal('register')}>
            Create your free account
          </Button>
        </div>
      )}
    </div>
  );
}
