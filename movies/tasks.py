from celery import shared_task
from django.conf import settings
from django.core.cache import cache

from . import constants, tmdb_client
from .models import Movie


def _cache_key_popular(page: int) -> str:
    return constants.CACHE_KEY_POPULAR.format(page=page)


def _cache_key_search(query: str, page: int) -> str:
    return constants.CACHE_KEY_SEARCH.format(query=query.lower().strip(), page=page)


def _cache_key_movie(tmdb_id: int) -> str:
    return constants.CACHE_KEY_MOVIE.format(tmdb_id=tmdb_id)


def _safe_cache_set(key: str, value, timeout: int) -> None:
    try:
        cache.set(key, value, timeout=timeout)
    except Exception:
        pass


def _safe_cache_delete(key: str) -> None:
    try:
        cache.delete(key)
    except Exception:
        pass


def _clear_pending(cache_key: str) -> None:
    _safe_cache_delete(f"{cache_key}{constants.CACHE_KEY_PENDING_SUFFIX}")


def _upsert_movie(data: dict) -> Movie:
    release_date = data.get("release_date") or None
    if release_date == "":
        release_date = None

    movie, _ = Movie.objects.update_or_create(
        tmdb_id=data["id"],
        defaults={
            "title": data.get("title") or data.get("name") or "",
            "overview": data.get("overview") or "",
            "poster_path": data.get("poster_path") or "",
            "release_date": release_date,
            "vote_average": data.get("vote_average") or 0.0,
            "runtime": data.get("runtime"),
            "genres": data.get("genres") or [],
        },
    )
    return movie


@shared_task(name="movies.fetch_popular_movies")
def fetch_popular_movies(page: int = 1) -> dict:
    cache_key = _cache_key_popular(page)
    try:
        data = tmdb_client.get_popular_movies(page=page)
        _safe_cache_set(cache_key, data, settings.TMDB_CACHE_TTL)
        return data
    finally:
        _clear_pending(cache_key)


@shared_task(name="movies.search_movies")
def search_movies_task(query: str, page: int = 1) -> dict:
    cache_key = _cache_key_search(query, page)
    try:
        data = tmdb_client.search_movies(query=query, page=page)
        _safe_cache_set(cache_key, data, settings.TMDB_CACHE_TTL)
        return data
    finally:
        _clear_pending(cache_key)


@shared_task(name="movies.fetch_movie_detail")
def fetch_movie_detail(tmdb_id: int) -> dict:
    data = tmdb_client.get_movie_detail(tmdb_id)
    _safe_cache_set(_cache_key_movie(tmdb_id), data, settings.TMDB_CACHE_TTL)
    _upsert_movie(data)
    return data
