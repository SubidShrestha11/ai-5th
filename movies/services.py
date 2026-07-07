from django.conf import settings
from django.core.cache import cache
from django.db import transaction

from . import constants, tasks
from .models import Movie, MovieLog


def _cache_key_popular(page: int) -> str:
    return constants.CACHE_KEY_POPULAR.format(page=page)


def _cache_key_search(query: str, page: int) -> str:
    return constants.CACHE_KEY_SEARCH.format(query=query.lower().strip(), page=page)


def _cache_key_movie(tmdb_id: int) -> str:
    return constants.CACHE_KEY_MOVIE.format(tmdb_id=tmdb_id)


def _pending_key(cache_key: str) -> str:
    return f"{cache_key}{constants.CACHE_KEY_PENDING_SUFFIX}"


def _normalize_query(query: str | None) -> str | None:
    if query is None:
        return None
    normalized = query.strip()
    return normalized or None


_redis_available_cache: bool | None = None


def _redis_available() -> bool:
    global _redis_available_cache
    if _redis_available_cache is not None:
        return _redis_available_cache

    try:
        import redis

        client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
        _redis_available_cache = client.ping()
    except Exception:
        _redis_available_cache = False

    return _redis_available_cache


def _safe_cache_get(key: str):
    try:
        return cache.get(key)
    except Exception:
        return None


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


def _dispatch_background_task(task, cache_key: str, *args) -> None:
    pending_key = _pending_key(cache_key)
    if _safe_cache_get(pending_key):
        return

    _safe_cache_set(pending_key, True, constants.PENDING_TTL)

    if _redis_available():
        try:
            task.delay(*args)
            return
        except Exception:
            pass

    try:
        task.run(*args)
    finally:
        _safe_cache_delete(pending_key)


def _run_celery_task(task, *args, timeout: int = 15):
    if not _redis_available():
        return task.run(*args)

    try:
        return task.delay(*args).get(timeout=timeout)
    except Exception:
        return task.run(*args)


def _build_page_response(tmdb_data: dict, page: int, *, status: str = "ready") -> dict:
    return {
        "status": status,
        "page": tmdb_data.get("page", page),
        "total_pages": tmdb_data.get("total_pages", 0),
        "total_results": tmdb_data.get("total_results", 0),
        "results": tmdb_data.get("results", []),
    }


def _build_pending_response(page: int) -> dict:
    return _build_page_response({}, page, status="pending")


def browse_movies(query: str | None = None, page: int = 1) -> dict:
    resolved_query = _normalize_query(query)

    if resolved_query:
        cache_key = _cache_key_search(resolved_query, page)
        fetch_task = tasks.search_movies_task
        fetch_args = (resolved_query, page)
    else:
        cache_key = _cache_key_popular(page)
        fetch_task = tasks.fetch_popular_movies
        fetch_args = (page,)

    cached = _safe_cache_get(cache_key)
    if cached:
        return _build_page_response(cached, page)

    if not _redis_available():
        data = fetch_task.run(*fetch_args)
        return _build_page_response(data, page)

    _dispatch_background_task(fetch_task, cache_key, *fetch_args)
    return _build_pending_response(page)


def get_popular_movies(page: int = 1) -> dict:
    cached = _safe_cache_get(_cache_key_popular(page))
    if cached:
        return cached

    return _run_celery_task(tasks.fetch_popular_movies, page)


def search_movies(query: str, page: int = 1) -> dict:
    cached = _safe_cache_get(_cache_key_search(query, page))
    if cached:
        return cached

    return _run_celery_task(tasks.search_movies_task, query, page)


def get_movie_detail(tmdb_id: int) -> dict:
    cached = _safe_cache_get(_cache_key_movie(tmdb_id))
    if cached:
        return cached

    return _run_celery_task(tasks.fetch_movie_detail, tmdb_id)


def get_or_fetch_movie(tmdb_id: int) -> Movie:
    movie = Movie.objects.filter(tmdb_id=tmdb_id).first()
    if movie:
        return movie

    detail = get_movie_detail(tmdb_id)
    return Movie.objects.get(tmdb_id=detail["id"])


@transaction.atomic
def create_movie_log(user, validated_data: dict) -> MovieLog:
    movie = get_or_fetch_movie(validated_data["tmdb_id"])

    return MovieLog.objects.create(
        user=user,
        movie=movie,
        watched_date=validated_data["watched_date"],
        rating=validated_data.get("rating"),
        review_text=validated_data.get("review_text", ""),
    )


def update_movie_log(log: MovieLog, validated_data: dict) -> MovieLog:
    for field in ("watched_date", "rating", "review_text"):
        if field in validated_data:
            setattr(log, field, validated_data[field])
    log.save()
    return log
