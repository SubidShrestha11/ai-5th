from django.conf import settings
from rest_framework import serializers

from . import constants
from .models import Movie, MovieLog


def build_poster_url(poster_path: str | None) -> str | None:
    if not poster_path:
        return None
    return f"{settings.TMDB_IMAGE_BASE_URL}{poster_path}"


class TMDBMovieSerializer(serializers.Serializer):
    tmdb_id = serializers.IntegerField(source="id")
    title = serializers.CharField()
    overview = serializers.CharField()
    poster_path = serializers.CharField(allow_null=True, required=False)
    poster_url = serializers.SerializerMethodField()
    release_date = serializers.CharField(allow_blank=True, required=False)
    vote_average = serializers.FloatField()

    def get_poster_url(self, obj: dict) -> str | None:
        return build_poster_url(obj.get("poster_path"))


class TMDBMovieDetailSerializer(TMDBMovieSerializer):
    runtime = serializers.IntegerField(allow_null=True, required=False)
    genres = serializers.ListField(child=serializers.DictField(), required=False)


class TMDBCursorPaginatedResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=("ready", "pending"))
    results = TMDBMovieSerializer(many=True)
    next_cursor = serializers.CharField(allow_null=True)
    previous_cursor = serializers.CharField(allow_null=True)


class TMDBPaginatedResponseSerializer(serializers.Serializer):
    page = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    total_results = serializers.IntegerField()
    results = TMDBMovieSerializer(many=True)


class MovieSerializer(serializers.ModelSerializer):
    tmdb_id = serializers.IntegerField(read_only=True)
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = (
            "tmdb_id",
            "title",
            "overview",
            "poster_path",
            "poster_url",
            "release_date",
            "vote_average",
            "runtime",
            "genres",
        )

    def get_poster_url(self, obj: Movie) -> str | None:
        return build_poster_url(obj.poster_path)


class MovieLogSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    tmdb_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = MovieLog
        fields = (
            "id",
            "tmdb_id",
            "movie",
            "watched_date",
            "rating",
            "review_text",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "movie", "created_at", "updated_at")

    def validate_rating(self, value):
        if value is None:
            return value
        if value < constants.MIN_RATING or value > constants.MAX_RATING:
            raise serializers.ValidationError(
                f"Rating must be between {constants.MIN_RATING} and {constants.MAX_RATING}."
            )
        return value


class MovieLogCreateSerializer(serializers.Serializer):
    tmdb_id = serializers.IntegerField(min_value=1)
    watched_date = serializers.DateField()
    rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=1,
        required=False,
        allow_null=True,
    )
    review_text = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_rating(self, value):
        if value is None:
            return value
        if value < constants.MIN_RATING or value > constants.MAX_RATING:
            raise serializers.ValidationError(
                f"Rating must be between {constants.MIN_RATING} and {constants.MAX_RATING}."
            )
        return value


class MovieSearchQuerySerializer(serializers.Serializer):
    q = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    cursor = serializers.CharField(required=False, allow_blank=True, default="")


class PageQuerySerializer(serializers.Serializer):
    page = serializers.IntegerField(min_value=1, required=False, default=1)
