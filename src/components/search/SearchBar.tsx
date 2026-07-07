import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Film, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { posterUrl, releaseYear } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
}

export function SearchBar({ className = '', placeholder = 'Search films...', onNavigate }: SearchBarProps) {
  const { movies, loading, query, setQuery, clear } = useSearch();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = focused && query.trim().length > 0;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = () => {
    clear();
    setFocused(false);
    onNavigate?.();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className={`flex items-center gap-2 bg-[#162032] border rounded-xl px-3 h-10 transition-all duration-200 ${
        focused ? 'border-sky-300/40 ring-1 ring-sky-300/20' : 'border-white/10 hover:border-white/20'
      }`}>
        {loading ? (
          <Loader2 size={16} className="text-slate-500 shrink-0 animate-spin" />
        ) : (
          <Search size={16} className="text-slate-500 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-results"
        />
        {query && (
          <button
            type="button"
            onClick={() => { clear(); inputRef.current?.focus(); }}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          id="search-results"
          className="absolute top-full mt-2 left-0 right-0 glass rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden max-h-80 overflow-y-auto"
          role="listbox"
        >
          {movies.length === 0 && !loading && (
            <div className="p-4 text-sm text-slate-400 text-center">
              No results for "{query}"
            </div>
          )}

          {movies.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Films
              </p>
              {movies.slice(0, 6).map(movie => {
                const poster = posterUrl(movie.poster_path, 'w92');
                return (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    onClick={handleSelect}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/8 transition-all duration-150 group"
                    role="option"
                    aria-selected="false"
                  >
                    <div className="w-8 h-12 rounded-md overflow-hidden bg-[#162032] shrink-0 ring-1 ring-white/10">
                      {poster ? (
                        <img src={poster} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={12} className="text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white leading-tight line-clamp-1">
                        {movie.title}
                      </p>
                      <p className="text-xs text-slate-500">{releaseYear(movie.release_date)}</p>
                    </div>
                    <span className="text-xs text-amber-400 font-medium shrink-0">
                      ★ {movie.vote_average.toFixed(1)}
                    </span>
                  </Link>
                );
              })}
              {movies.length > 6 && (
                <Link
                  to={`/search?q=${encodeURIComponent(query)}`}
                  onClick={handleSelect}
                  className="flex items-center justify-center p-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                >
                  View all {movies.length} results →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
