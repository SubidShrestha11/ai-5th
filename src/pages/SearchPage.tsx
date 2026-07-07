import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, User, Search as SearchIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MovieCard } from '@/components/movies/MovieCard';
import { Avatar, Badge } from '@/components/ui';
import { useSearch } from '@/hooks/useSearch';
import { posterUrl } from '@/lib/utils';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const { movies, users, loading, query, setQuery } = useSearch();

  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [urlQuery, query, setQuery]);

  const hasResults = movies.length > 0 || users.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-white">Search</h1>
        <p className="text-slate-400 mt-1">Find films, people, and reviews</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-[#101827] border border-white/10 rounded-2xl px-4 h-14 focus-within:border-sky-300/40 focus-within:ring-1 focus-within:ring-sky-300/20 transition-all duration-200">
          {loading ? (
            <Loader2 size={20} className="text-slate-500 shrink-0 animate-spin" />
          ) : (
            <SearchIcon size={20} className="text-slate-500 shrink-0" />
          )}
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for a film, director, or user..."
            className="flex-1 bg-transparent text-base text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
            autoComplete="off"
          />
          {query && (
            <span className="text-xs text-slate-500 shrink-0">
              {movies.length + users.length} results
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!query && (
        <div className="text-center py-16">
          <SearchIcon size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Start typing to search</p>
          <p className="text-slate-600 text-sm mt-1">
            Search across thousands of films and users
          </p>
        </div>
      )}

      {/* No results */}
      {query && !loading && !hasResults && (
        <div className="text-center py-16">
          <p className="text-slate-400 font-medium">No results for "{query}"</p>
          <p className="text-slate-600 text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* Movie Results */}
      {movies.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Film size={16} className="text-sky-300" />
            <h2 className="font-semibold text-white">
              Films
              <span className="ml-2 text-xs text-slate-500">{movies.length} results</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} size="md" />
            ))}
          </div>
        </section>
      )}

      {/* User Results */}
      {users.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-violet-400" />
            <h2 className="font-semibold text-white">
              People
              <span className="ml-2 text-xs text-slate-500">{users.length} results</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map(user => {
              const avatar = user.avatar ? posterUrl(user.avatar, 'w185') : null;
              return (
                <Link
                  key={user.id}
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-white/8 hover:border-white/15 transition-all duration-200 group"
                >
                  <Avatar name={user.displayName} src={avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 group-hover:text-sky-300 transition-colors leading-tight">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                    {user.bio && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{user.bio}</p>
                    )}
                  </div>
                  <Badge variant="default" size="sm">{user.moviesWatched} films</Badge>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
