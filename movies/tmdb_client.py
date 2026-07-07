from django.conf import settings
from rest_framework.exceptions import APIException

import requests


class TMDBError(APIException):
    status_code = 502
    default_detail = "Unable to fetch data from TMDB."
    default_code = "tmdb_error"


def _auth_headers() -> dict:
    if settings.TMDB_ACCESS_TOKEN:
        return {"Authorization": f"Bearer {settings.TMDB_ACCESS_TOKEN}"}
    return {}


def _auth_params(params: dict | None = None) -> dict:
    query = dict(params or {})
    if settings.TMDB_API_KEY:
        query["api_key"] = settings.TMDB_API_KEY
    return query


def _request(method: str, path: str, params: dict | None = None) -> dict:
    url = f"{settings.TMDB_BASE_URL}{path}"
    try:
        response = requests.request(
            method,
            url,
            params=_auth_params(params),
            headers=_auth_headers(),
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        raise TMDBError(detail=f"TMDB request failed: {exc}") from exc


def get_popular_movies(page: int = 1) -> dict:
    return _request("GET", "/movie/popular", {"page": page})


def search_movies(query: str, page: int = 1) -> dict:
    return _request("GET", "/search/movie", {"query": query, "page": page})


def get_movie_detail(tmdb_id: int) -> dict:
    return _request("GET", f"/movie/{tmdb_id}")
