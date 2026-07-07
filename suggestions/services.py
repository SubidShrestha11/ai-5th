import random

from django.conf import settings

from friends import services as friend_services
from movies import services as movie_services
from movies.models import Movie

from . import constants


def _paginate_list(items: list, page: int, page_size: int) -> dict:
    total = len(items)
    total_pages = (total + page_size - 1) // page_size if total else 0
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "page": page,
        "total_pages": total_pages,
        "total_results": total,
        "results": items[start:end],
    }


def _get_shuffled_friend_movies(user) -> list[Movie]:
    friend_ids = friend_services.get_friend_user_ids(user)
    if not friend_ids:
        return []

    movies = list(Movie.objects.filter(logs__user_id__in=friend_ids).distinct())
    rng = random.Random(str(user.id))
    rng.shuffle(movies)
    return movies


def get_suggestions(user, *, page: int = 1) -> dict:
    page_size = settings.REST_FRAMEWORK.get("PAGE_SIZE", constants.DEFAULT_PAGE_SIZE)
    friend_movies = _get_shuffled_friend_movies(user)

    if friend_movies:
        payload = _paginate_list(friend_movies, page, page_size)
        payload["source"] = constants.SOURCE_FRIENDS
        return payload

    popular = movie_services.get_popular_movies(page=page)
    return {
        "source": constants.SOURCE_POPULAR,
        "page": popular.get("page", page),
        "total_pages": popular.get("total_pages", 0),
        "total_results": popular.get("total_results", 0),
        "results": popular.get("results", []),
    }
