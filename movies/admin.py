from django.contrib import admin

from .models import Movie, MovieLog


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("tmdb_id", "title", "release_date", "vote_average")
    search_fields = ("title",)
    ordering = ("title",)


@admin.register(MovieLog)
class MovieLogAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "watched_date", "rating", "created_at")
    list_select_related = ("user", "movie")
    search_fields = ("user__email", "movie__title")
    ordering = ("-watched_date",)
