import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Search as SearchIcon, Loader2 } from 'lucide-react';
import { MovieCard } from '@/components/movies/MovieCard';
import { useSearchMovies, useBrowseMovies } from '@/hooks/queries/movies';
import { getErrorMessage } from '@/api/errors';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [input, setInput] = useState(urlQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const trimmed = input.trim();
      if (trimmed === urlQuery) return;
      setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, urlQuery, setSearchParams]);

  const searchQuery = urlQuery.trim();
  const {
    data: searchResults = [],
    isLoading: searchLoading,
    isFetching: searchFetching,
    error: searchError,
  } = useSearchMovies(searchQuery, searchQuery.length > 0);
  const {
    data: browseResults = [],
    isLoading: browseLoading,
    isFetching: browseFetching,
    error: browseError,
  } = useBrowseMovies(1, searchQuery.length === 0);

  const movies = searchQuery.length > 0 ? searchResults : browseResults;
  const loading =
    searchQuery.length > 0
      ? searchLoading || (searchFetching && searchQuery.length > 0)
      : browseLoading || browseFetching;
  const error = searchQuery.length > 0 ? searchError : browseError;
  const errorMessage = error ? getErrorMessage(error) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif text-white">Search</h1>
        <p className="text-slate-400 mt-1">Find films from TMDB</p>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 bg-[#101827] border border-white/10 rounded-2xl px-4 h-14 focus-within:border-sky-300/40 focus-within:ring-1 focus-within:ring-sky-300/20 transition-all duration-200">
          {loading ? (
            <Loader2 size={20} className="text-slate-500 shrink-0 animate-spin" />
          ) : (
            <SearchIcon size={20} className="text-slate-500 shrink-0" />
          )}
          <input
            type="search"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search for a film..."
            className="flex-1 bg-transparent text-base text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
            autoComplete="off"
          />
          {searchQuery && !loading && (
            <span className="text-xs text-slate-500 shrink-0">
              {movies.length} results
            </span>
          )}
        </div>
      </div>

      {!searchQuery && !loading && movies.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Film size={16} className="text-sky-300" />
            <h2 className="font-semibold text-white">Popular on TMDB</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} size="md" />
            ))}
          </div>
        </section>
      )}

      {!searchQuery && !loading && movies.length === 0 && !errorMessage && (
        <div className="text-center py-16">
          <SearchIcon size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Start typing to search</p>
          <p className="text-slate-600 text-sm mt-1">
            Search across thousands of films
          </p>
        </div>
      )}

      {searchQuery && errorMessage && !loading && (
        <div className="text-center py-16">
          <p className="text-red-400 font-medium">{errorMessage}</p>
        </div>
      )}

      {searchQuery && !loading && !errorMessage && movies.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 font-medium">No results for "{searchQuery}"</p>
          <p className="text-slate-600 text-sm mt-1">Try a different search term</p>
        </div>
      )}

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
    </div>
  );
}
