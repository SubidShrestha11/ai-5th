from django.urls import path

from .views import (
    MovieDetailView,
    MovieLogDetailView,
    MovieLogListCreateView,
    MovieSearchView,
    PopularMoviesView,
)

urlpatterns = [
    path("movies/popular/", PopularMoviesView.as_view(), name="movies-popular"),
    path("movies/search/", MovieSearchView.as_view(), name="movies-search"),
    path("movies/logs/", MovieLogListCreateView.as_view(), name="movie-logs"),
    path("movies/logs/<uuid:log_id>/", MovieLogDetailView.as_view(), name="movie-log-detail"),
    path("movies/<int:tmdb_id>/", MovieDetailView.as_view(), name="movie-detail"),
]
