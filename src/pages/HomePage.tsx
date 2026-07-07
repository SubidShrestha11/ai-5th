import { Film, Sparkles } from 'lucide-react';
import { FeaturedMovie } from '@/components/movies/FeaturedMovie';
import { MovieCarousel } from '@/components/movies/MovieCarousel';
import { MovieCard } from '@/components/movies/MovieCard';
import { Button } from '@/components/ui';
import { useTrending, useTopRated, usePopular } from '@/hooks/useMovies';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { MOCK_MOVIES, CURATED_COLLECTIONS } from '@/lib/mockData';

function CollectionSection({ collection }: { collection: (typeof CURATED_COLLECTIONS)[0] }) {
  const movies = MOCK_MOVIES.filter(m => collection.movieIds.includes(m.id));
  return (
    <section key={collection.id} className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-4 rounded-full bg-violet-400" />
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Curated Collection
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif text-white">{collection.title}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{collection.description}</p>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2" role="list">
        {movies.map(movie => (
          <div key={movie.id} role="listitem">
            <MovieCard movie={movie} size="md" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { movies: trending, loading: trendingLoading } = useTrending();
  const { movies: topRated, loading: topRatedLoading } = useTopRated();
  const { movies: popular, loading: popularLoading } = usePopular();
  const { movies: suggestions, loading: suggestionsLoading } = useSuggestions();

  const featured = trending[0] ?? MOCK_MOVIES[0];
  const sortedByRating = [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average);

  return (
    <div className="space-y-12">
      {/* Hero CTA for non-auth users */}
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

      {/* Featured Film */}
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

      {/* Trending */}
      <MovieCarousel
        title="Trending This Week"
        subtitle="What the world is watching"
        movies={trending.length > 0 ? trending : MOCK_MOVIES.slice(0, 10)}
        loading={trendingLoading}
        cardSize="md"
      />

      {/* Suggestions (auth only) */}
      {isAuthenticated && (
        <MovieCarousel
          title="Recommended For You"
          subtitle="Based on your watching history"
          movies={suggestions}
          loading={suggestionsLoading}
          cardSize="md"
        />
      )}

      {/* Top Rated */}
      <MovieCarousel
        title="All-Time Classics"
        subtitle="The highest rated films of all time"
        movies={topRated.length > 0 ? topRated : sortedByRating.slice(0, 10)}
        loading={topRatedLoading}
        cardSize="md"
      />

      {/* Curated Collections */}
      {CURATED_COLLECTIONS.map(collection => (
        <CollectionSection key={collection.id} collection={collection} />
      ))}

      {/* Popular Now */}
      <MovieCarousel
        title="Popular Now"
        subtitle="What everyone is talking about"
        movies={popular.length > 0 ? popular : MOCK_MOVIES.slice(5, 15)}
        loading={popularLoading}
        cardSize="md"
      />

      {/* Footer CTA */}
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
